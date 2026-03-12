const cron = require('node-cron');
const { getDB } = require('../db');
const { sendConfirmationMessage } = require('./whatsappService');

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running reminder checks...');

    try {
        const db = getDB();
        const now = new Date();

        // Find all pending orders with their message counts
        const pendingOrders = await db.collection('orders')
            .find({ status: 'pending' })
            .toArray();

        for (const order of pendingOrders) {
            const messageCount = await db.collection('messages').countDocuments({
                order_id: order.id,
                message_type: 'system'
            });

            const hoursSinceCreation = Math.abs(now - new Date(order.created_at)) / 36e5;

            if (messageCount === 1 && hoursSinceCreation >= 1) {
                await sendConfirmationMessage(order);
            } else if (messageCount === 2 && hoursSinceCreation >= 24) {
                await sendConfirmationMessage(order);
            } else if (messageCount === 3 && hoursSinceCreation >= 48) {
                await sendConfirmationMessage(order);
            }
        }
    } catch (error) {
        console.error('[CRON] Error during execution:', error);
    }
});

console.log('[CRON] Service initialized.');
