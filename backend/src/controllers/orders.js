const prisma = require('../db');
const { processNewOrder } = require('../services/orderService');
const { v4: uuidv4 } = require('uuid');

const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { brand_id: req.user.id },
            orderBy: { created_at: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConfirmedOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                brand_id: req.user.id,
                status: 'confirmed',
            },
            orderBy: { confirmed_at: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCustomOrder = async (req, res) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }

    try {
        const integration = await prisma.integration.findUnique({
            where: { custom_api_key: apiKey },
        });

        if (!integration) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        const { name, phone, product, color, price, address } = req.body;

        const formattedData = {
            brand_id: integration.brand_id,
            order_number: `CUS-${uuidv4().split('-')[0]}`,
            customer_name: name || 'Customer',
            phone: phone || '0000000000',
            product_name: product || 'Product',
            product_color: color || 'N/A',
            price: parseFloat(price || 0),
            address: address || '',
            source_platform: 'custom_api',
        };

        const newOrder = await processNewOrder(formattedData);
        res.status(201).json(newOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrders,
    getConfirmedOrders,
    createCustomOrder,
};
