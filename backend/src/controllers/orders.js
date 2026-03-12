const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { processNewOrder } = require('../services/orderService');

const getOrders = async (req, res) => {
    try {
        const db = getDB();
        const orders = await db.collection('orders')
            .find({ brand_id: req.user.id })
            .sort({ created_at: -1 })
            .toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConfirmedOrders = async (req, res) => {
    try {
        const db = getDB();
        const orders = await db.collection('orders')
            .find({ brand_id: req.user.id, status: 'confirmed' })
            .sort({ confirmed_at: -1 })
            .toArray();
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
        const db = getDB();
        const integration = await db.collection('integrations').findOne({ custom_api_key: apiKey });

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
