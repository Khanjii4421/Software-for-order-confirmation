const prisma = require('../db');
const { sendConfirmationMessage } = require('./whatsappService');

const processNewOrder = async (orderData) => {
    try {
        // 1. Save order to DB
        const order = await prisma.order.create({
            data: {
                brand_id: orderData.brand_id,
                order_number: orderData.order_number,
                customer_name: orderData.customer_name,
                phone: orderData.phone,
                product_name: orderData.product_name,
                product_color: orderData.product_color || '',
                price: orderData.price,
                address: orderData.address || '',
                source_platform: orderData.source_platform,
                status: 'pending'
            }
        });

        // 2. Send Whatsapp message
        await sendConfirmationMessage(order);

        return order;
    } catch (error) {
        console.error('Error processing new order:', error);
        throw error;
    }
};

module.exports = {
    processNewOrder
};
