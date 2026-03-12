const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { sendConfirmationMessage } = require('./whatsappService');

const processNewOrder = async (orderData) => {
    try {
        const db = getDB();
        const orderId = uuidv4();

        const order = {
            id: orderId,
            brand_id: orderData.brand_id,
            order_number: orderData.order_number,
            customer_name: orderData.customer_name,
            phone: orderData.phone,
            product_name: orderData.product_name,
            product_color: orderData.product_color || '',
            price: orderData.price,
            address: orderData.address || '',
            source_platform: orderData.source_platform,
            status: 'pending',
            created_at: new Date(),
            confirmed_at: null
        };

        await db.collection('orders').insertOne(order);

        // Send WhatsApp message
        await sendConfirmationMessage(order);

        return order;
    } catch (error) {
        console.error('Error processing new order:', error);
        throw error;
    }
};

module.exports = { processNewOrder };
