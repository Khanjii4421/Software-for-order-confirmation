const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const prisma = require('../db');

// Multi-tenant Whatsapp clients
const clients = new Map();

// Generate QR code and initialize client
const initializeClient = async (brandId, io) => {
    if (clients.has(brandId)) {
        const client = clients.get(brandId);
        if (client.info) return { status: 'connected' };
        return { status: 'initializing' };
    }

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: brandId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    clients.set(brandId, client);

    client.on('qr', (qr) => {
        console.log(`[Brand ${brandId}] QR RECEIVED`);
        if (io) io.emit(`qr-${brandId}`, { qr });
    });

    client.on('ready', async () => {
        console.log(`[Brand ${brandId}] Client is ready!`);
        await prisma.integration.update({
            where: { brand_id: brandId },
            data: { whatsapp_connected: true }
        });
        if (io) io.emit(`ready-${brandId}`, { status: 'connected' });
    });

    client.on('auth_failure', async (msg) => {
        console.error(`[Brand ${brandId}] AUTHENTICATION FAILURE`, msg);
        clients.delete(brandId);
    });

    client.on('disconnected', async (reason) => {
        console.log(`[Brand ${brandId}] Client was logged out`, reason);
        clients.delete(brandId);
        await prisma.integration.update({
            where: { brand_id: brandId },
            data: { whatsapp_connected: false }
        });
    });

    // Listen for incoming messages
    client.on('message', async (msg) => {
        try {
            if (msg.from === 'status@broadcast') return;

            const contact = await msg.getContact();
            const phone = contact.id.user; // getting phone number
            const body = msg.body.trim();

            // Look up pending order for this phone and brand
            const order = await prisma.order.findFirst({
                where: {
                    brand_id: brandId,
                    phone: { contains: phone },
                    status: 'pending'
                },
                orderBy: { created_at: 'desc' }
            });

            if (!order) return;

            if (body === '1') {
                // Confirm
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'confirmed', confirmed_at: new Date() }
                });

                await client.sendMessage(msg.from, `Thank you! Your order for ${order.product_name} has been confirmed. ☑️`);

                // Log message
                await prisma.message.create({
                    data: { order_id: order.id, phone: phone, message: body, message_type: 'customer' }
                });

            } else if (body === '2') {
                // Cancel
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'cancelled' }
                });

                await client.sendMessage(msg.from, `Your order for ${order.product_name} has been cancelled. ❌`);

                // Log message
                await prisma.message.create({
                    data: { order_id: order.id, phone: phone, message: body, message_type: 'customer' }
                });
            }
        } catch (err) {
            console.error('Error handling incoming wapp message:', err);
        }
    });

    client.initialize().catch(err => {
        console.error(`Error initializing client for brand ${brandId}:`, err);
        clients.delete(brandId);
    });

    return { status: 'initializing' };
};

const sendConfirmationMessage = async (order) => {
    const brandId = order.brand_id;
    const client = clients.get(brandId);

    if (!client || !client.info) {
        console.log(`WhatsApp not connected for brand ${brandId}`);
        return;
    }

    // Format phone (very basic, ideally use a library like libphonenumber-js to map back to E.164 without +)
    let phone = order.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('92') && phone.startsWith('03')) phone = '92' + phone.substring(1); // Assuming Pakistan as per Assalamualaikum, but ideally handle generic formats

    const chatId = `${phone}@c.us`;

    const template = `Assalamualaikum ${order.customer_name},\n\nYou placed an order:\n\nProduct: ${order.product_name}\nColor: ${order.product_color}\nPrice: ${order.price}\n\nPlease confirm your order.\n\nReply with:\n1 to Confirm\n2 to Cancel`;

    try {
        await client.sendMessage(chatId, template);

        await prisma.message.create({
            data: {
                order_id: order.id,
                phone: order.phone,
                message: template,
                message_type: 'system'
            }
        });

    } catch (error) {
        console.error(`Failed to send message to ${phone}:`, error);
    }
};

const getStatus = async (brandId, io) => {
    const integration = await prisma.integration.findUnique({ where: { brand_id: brandId } });

    if (!integration || !integration.whatsapp_connected) {
        return { status: 'disconnected' };
    }

    const client = clients.get(brandId);
    if (client && client.info) {
        return { status: 'connected' };
    }

    // Try to auto-connect if disconnected from memory but should be connected
    if (!clients.has(brandId)) {
        console.log(`[Brand ${brandId}] Eager restore of whatsapp session...`);
        initializeClient(brandId, io); // will run in background
        return { status: 'initializing' };
    }

    return { status: 'initializing' };
}

const logoutClient = async (brandId) => {
    const client = clients.get(brandId);
    if (client) {
        try {
            await client.logout();
        } catch (e) { }
        client.destroy();
        clients.delete(brandId);
    }
    await prisma.integration.update({
        where: { brand_id: brandId },
        data: { whatsapp_connected: false }
    });
}

module.exports = {
    initializeClient,
    sendConfirmationMessage,
    getStatus,
    logoutClient
};
