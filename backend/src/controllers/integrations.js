const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');
const { processNewOrder } = require('../services/orderService');

const getIntegrations = async (req, res) => {
    try {
        const integrations = await prisma.integration.findUnique({
            where: { brand_id: req.user.id }
        });
        res.json(integrations || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateShopify = async (req, res) => {
    const { shopify_api_key } = req.body;
    try {
        const integration = await prisma.integration.upsert({
            where: { brand_id: req.user.id },
            update: { shopify_api_key },
            create: { brand_id: req.user.id, shopify_api_key }
        });
        res.json(integration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateWordpress = async (req, res) => {
    const { wordpress_webhook } = req.body;
    try {
        const integration = await prisma.integration.upsert({
            where: { brand_id: req.user.id },
            update: { wordpress_webhook },
            create: { brand_id: req.user.id, wordpress_webhook }
        });
        res.json(integration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateCustomKey = async (req, res) => {
    const custom_api_key = uuidv4();
    try {
        const integration = await prisma.integration.upsert({
            where: { brand_id: req.user.id },
            update: { custom_api_key },
            create: { brand_id: req.user.id, custom_api_key }
        });
        res.json({ custom_api_key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const shopifyWebhook = async (req, res) => {
    const { brandId } = req.params;
    const orderData = req.body;

    try {
        // Validate brandId
        const brand = await prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand) return res.status(404).send('Brand not found');

        // Make sure it's an order creation request
        if (!orderData || !orderData.id) return res.status(400).send('Invalid data');

        // Extract necessary info from Shopify webhook payload
        const customer = orderData.customer || {};
        const address = orderData.shipping_address || {};
        const lineItem = orderData.line_items?.[0] || {};

        // Shopify formatting
        const formattedData = {
            brand_id: brandId,
            order_number: orderData.name || String(orderData.id),
            customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer',
            phone: address.phone || customer.phone || '0000000000',
            product_name: lineItem.name || 'Product',
            product_color: lineItem.variant_title || 'N/A',
            price: parseFloat(orderData.total_price || 0),
            address: `${address.address1 || ''}, ${address.city || ''}`.trim(),
            source_platform: 'shopify'
        };

        await processNewOrder(formattedData);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Shopify Webhook Error:', error);
        res.status(500).send('Internal Error');
    }
};

const wordpressWebhook = async (req, res) => {
    const { brandId } = req.params;
    const orderData = req.body;

    try {
        // Basic verification
        const brand = await prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand) return res.status(404).send('Brand not found');

        if (!orderData || !orderData.id) return res.status(400).send('Invalid data');

        const address = orderData.shipping || orderData.billing || {};
        const lineItem = orderData.line_items?.[0] || {};

        const formattedData = {
            brand_id: brandId,
            order_number: orderData.number || String(orderData.id),
            customer_name: `${address.first_name || ''} ${address.last_name || ''}`.trim() || 'Customer',
            phone: address.phone || '0000000000',
            product_name: lineItem.name || 'Product',
            product_color: lineItem.meta_data?.find(m => m.key === 'pa_color')?.value || 'N/A',
            price: parseFloat(orderData.total || 0),
            address: `${address.address_1 || ''}, ${address.city || ''}`.trim(),
            source_platform: 'wordpress'
        };

        await processNewOrder(formattedData);
        res.status(200).send('OK');
    } catch (error) {
        console.error('WordPress Webhook Error:', error);
        res.status(500).send('Internal Error');
    }
};

const updateMeta = async (req, res) => {
    const { meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id } = req.body;
    try {
        const integration = await prisma.integration.upsert({
            where: { brand_id: req.user.id },
            update: { meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id },
            create: { brand_id: req.user.id, meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id }
        });
        res.json(integration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIntegrations,
    updateShopify,
    updateWordpress,
    generateCustomKey,
    shopifyWebhook,
    wordpressWebhook,
    updateMeta
};
