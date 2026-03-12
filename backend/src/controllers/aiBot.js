const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// ─── GET BOT CONFIG ────────────────────────────────────────
const getBotConfig = async (req, res) => {
    try {
        const db = getDB();
        const config = await db.collection('ai_bot_configs').findOne(
            { brand_id: req.user.id },
            { projection: { _id: 0 } }
        );

        if (config) {
            // Get product images
            const productImages = await db.collection('product_images')
                .find({ bot_config_id: config.id }, { projection: { _id: 0 } })
                .sort({ display_order: 1 })
                .toArray();
            config.productImages = productImages;
        }

        res.json(config || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── SAVE BOT CONFIG ───────────────────────────────────────
const saveBotConfig = async (req, res) => {
    const {
        openai_api_key, wa_phone_number_id, wa_access_token, wa_verify_token,
        bot_enabled, ai_personality, custom_prompt, product_name,
        product_description, product_price, product_min_price, currency, ai_model
    } = req.body;

    try {
        const db = getDB();
        const existing = await db.collection('ai_bot_configs').findOne({ brand_id: req.user.id });
        const configId = existing?.id || uuidv4();

        const configData = {
            id: configId,
            brand_id: req.user.id,
            openai_api_key,
            wa_phone_number_id,
            wa_access_token,
            wa_verify_token: wa_verify_token || 'ai_bot_secret',
            bot_enabled: bot_enabled === true || bot_enabled === 'true',
            ai_personality,
            custom_prompt,
            product_name,
            product_description,
            product_price: product_price ? parseFloat(product_price) : null,
            product_min_price: product_min_price ? parseFloat(product_min_price) : null,
            currency,
            ai_model: ai_model || 'gpt-4o-mini',
            updated_at: new Date()
        };

        if (!existing) configData.created_at = new Date();

        await db.collection('ai_bot_configs').updateOne(
            { brand_id: req.user.id },
            { $set: configData },
            { upsert: true }
        );

        res.json({ success: true, config: configData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── TOGGLE BOT ────────────────────────────────────────────
const toggleBot = async (req, res) => {
    const { enabled } = req.body;
    try {
        const db = getDB();
        await db.collection('ai_bot_configs').updateOne(
            { brand_id: req.user.id },
            { $set: { bot_enabled: enabled, updated_at: new Date() } },
            { upsert: true }
        );
        res.json({ success: true, bot_enabled: enabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── UPLOAD PRODUCT IMAGE ──────────────────────────────────
const uploadProductImage = async (req, res) => {
    try {
        const db = getDB();
        let config = await db.collection('ai_bot_configs').findOne({ brand_id: req.user.id });
        if (!config) {
            const configId = uuidv4();
            config = { id: configId, brand_id: req.user.id, created_at: new Date() };
            await db.collection('ai_bot_configs').insertOne(config);
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageId = uuidv4();
        const imageUrl = `/uploads/products/${req.file.filename}`;

        const image = {
            id: imageId,
            bot_config_id: config.id,
            image_url: imageUrl,
            image_name: req.file.originalname,
            display_order: 0,
            created_at: new Date()
        };

        await db.collection('product_images').insertOne(image);
        res.json({ success: true, image });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── DELETE PRODUCT IMAGE ──────────────────────────────────
const deleteProductImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        const db = getDB();
        const config = await db.collection('ai_bot_configs').findOne({ brand_id: req.user.id });
        if (!config) return res.status(404).json({ message: 'Config not found' });

        const image = await db.collection('product_images').findOne({
            id: imageId, bot_config_id: config.id
        });

        if (!image) return res.status(404).json({ message: 'Image not found' });

        const filePath = path.join(__dirname, '../../public', image.image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.collection('product_images').deleteOne({ id: imageId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET AI ORDERS ─────────────────────────────────────────
const getAIOrders = async (req, res) => {
    try {
        const db = getDB();
        const orders = await db.collection('ai_orders')
            .find({ brand_id: req.user.id }, { projection: { _id: 0 } })
            .sort({ created_at: -1 })
            .toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET SINGLE AI ORDER WITH CHAT ─────────────────────────
const getAIOrderChat = async (req, res) => {
    const { orderId } = req.params;
    try {
        const db = getDB();
        const order = await db.collection('ai_orders').findOne(
            { id: orderId, brand_id: req.user.id },
            { projection: { _id: 0 } }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });

        let messages = [];
        if (order.conversation_id) {
            const convo = await db.collection('ai_conversations').findOne({ id: order.conversation_id });
            messages = convo ? JSON.parse(convo.messages || '[]') : [];
        }

        res.json({ order, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET ALL CONVERSATIONS ─────────────────────────────────
const getConversations = async (req, res) => {
    try {
        const db = getDB();
        const config = await db.collection('ai_bot_configs').findOne({ brand_id: req.user.id });
        if (!config) return res.json([]);

        const conversations = await db.collection('ai_conversations')
            .find({ bot_config_id: config.id }, { projection: { _id: 0 } })
            .sort({ updated_at: -1 })
            .limit(50)
            .toArray();
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── TEST OPENAI API KEY ────────────────────────────────────
const testOpenAI = async (req, res) => {
    const { api_key } = req.body;
    if (!api_key) return res.status(400).json({ message: 'API key required' });

    try {
        const fetch = require('node-fetch');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${api_key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Say "API key is valid" in 5 words.' }],
                max_tokens: 20
            })
        });
        const data = await response.json();
        if (data.error) return res.status(400).json({ success: false, message: data.error.message });
        res.json({ success: true, message: 'OpenAI API key is valid ✅' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getBotConfig,
    saveBotConfig,
    toggleBot,
    uploadProductImage,
    deleteProductImage,
    getAIOrders,
    getAIOrderChat,
    getConversations,
    testOpenAI
};
