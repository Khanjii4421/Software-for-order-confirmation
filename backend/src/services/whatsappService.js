const prisma = require('../db');
const fetch = require('node-fetch');

// Meta Cloud API Logic
const sendMetaMessage = async (integration, order) => {
    const { meta_phone_number_id, meta_access_token, meta_template_name } = integration;
    const templateName = meta_template_name || "order_confirmation";

    // Normalize phone number to E.164 (without +)
    let phone = order.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('92') && phone.startsWith('03')) phone = '92' + phone.substring(1);

    const url = `https://graph.facebook.com/v18.0/${meta_phone_number_id}/messages`;

    const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en_US" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: order.customer_name },
                        { type: "text", text: order.order_number },
                        { type: "text", text: integration.brand.brand_name || "Our Shop" }
                    ]
                }
            ]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${meta_access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        await prisma.message.create({
            data: {
                order_id: order.id,
                phone: order.phone,
                message: `[Meta Template: ${templateName}]`,
                message_type: 'system'
            }
        });

        return data;
    } catch (error) {
        console.error(`Meta API Error for brand ${order.brand_id}:`, error);
        throw error;
    }
};

const sendConfirmationMessage = async (order) => {
    const brandId = order.brand_id;

    // Check if Meta is configured
    const integration = await prisma.integration.findUnique({
        where: { brand_id: brandId },
        include: { brand: true }
    });

    if (integration && integration.meta_access_token && integration.meta_phone_number_id) {
        try {
            console.log(`Sending via Meta Cloud API for brand ${brandId}`);
            return await sendMetaMessage(integration, order);
        } catch (error) {
            console.error("Meta API failed:", error);
            throw error;
        }
    } else {
        console.log(`WhatsApp not configured for brand ${brandId}`);
    }
};

const getStatus = async (brandId) => {
    const integration = await prisma.integration.findUnique({ where: { brand_id: brandId } });

    if (integration && integration.meta_access_token && integration.meta_phone_number_id) {
        return { status: 'connected', type: 'meta' };
    }

    return { status: 'disconnected' };
}

module.exports = {
    sendConfirmationMessage,
    getStatus
};
