const cron = require('node-cron');
const prisma = require('../db');
const { sendConfirmationMessage } = require('./whatsappService');

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running reminder checks...');

    try {
        const now = new Date();

        // Find all pending orders
        const pendingOrders = await prisma.order.findMany({
            where: { status: 'pending' },
            include: { messages: true }
        });

        for (const order of pendingOrders) {
            const systemMessages = order.messages.filter(m => m.message_type === 'system');
            const messageCount = systemMessages.length;

            // Time since order creation
            const hoursSinceCreation = Math.abs(now - new Date(order.created_at)) / 36e5;

            // Message 1: sent at creation (so count is at least 1)
            // Message 2: after 1 hour -> if count is 1 and hours > 1
            if (messageCount === 1 && hoursSinceCreation >= 1) {
                await sendConfirmationMessage(order);
            }
            // Message 3: after 24 hours -> if count is 2 and hours > 24
            else if (messageCount === 2 && hoursSinceCreation >= 24) {
                await sendConfirmationMessage(order);
            }
            // Message 4: after 48 hours -> if count is 3 and hours > 48
            else if (messageCount === 3 && hoursSinceCreation >= 48) {
                await sendConfirmationMessage(order);
            }
        }
    } catch (error) {
        console.error('[CRON] Error during execution:', error);
    }
});

console.log('[CRON] Service initialized.');
