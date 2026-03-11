const prisma = require('../db');
const path = require('path');
const fs = require('fs');

// ─── GET BOT CONFIG ────────────────────────────────────────
const getBotConfig = async (req, res) => {
    try {
        const config = await prisma.aIBotConfig.findUnique({
            where: { brand_id: req.user.id },
            include: { productImages: { orderBy: { display_order: 'asc' } } }
        });
        res.json(config || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── SAVE BOT CONFIG ───────────────────────────────────────
const saveBotConfig = async (req, res) => {
    const {
        openai_api_key,
        wa_phone_number_id,
        wa_access_token,
        wa_verify_token,
        bot_enabled,
        ai_personality,
        custom_prompt,
        product_name,
        product_description,
        product_price,
        product_min_price,
        currency,
        ai_model
    } = req.body;

    try {
        const config = await prisma.aIBotConfig.upsert({
            where: { brand_id: req.user.id },
            update: {
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
            },
            create: {
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
                ai_model: ai_model || 'gpt-4o-mini'
            }
        });
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── TOGGLE BOT ────────────────────────────────────────────
const toggleBot = async (req, res) => {
    const { enabled } = req.body;
    try {
        const config = await prisma.aIBotConfig.upsert({
            where: { brand_id: req.user.id },
            update: { bot_enabled: enabled, updated_at: new Date() },
            create: { brand_id: req.user.id, bot_enabled: enabled }
        });
        res.json({ success: true, bot_enabled: config.bot_enabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── UPLOAD PRODUCT IMAGE ──────────────────────────────────
const uploadProductImage = async (req, res) => {
    try {
        // Ensure bot config exists
        let config = await prisma.aIBotConfig.findUnique({ where: { brand_id: req.user.id } });
        if (!config) {
            config = await prisma.aIBotConfig.create({ data: { brand_id: req.user.id } });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;

        const image = await prisma.productImage.create({
            data: {
                bot_config_id: config.id,
                image_url: imageUrl,
                image_name: req.file.originalname,
                display_order: 0
            }
        });

        res.json({ success: true, image });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── DELETE PRODUCT IMAGE ──────────────────────────────────
const deleteProductImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        const config = await prisma.aIBotConfig.findUnique({ where: { brand_id: req.user.id } });
        if (!config) return res.status(404).json({ message: 'Config not found' });

        const image = await prisma.productImage.findFirst({
            where: { id: imageId, bot_config_id: config.id }
        });

        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Delete file from disk
        const filePath = path.join(__dirname, '../../public', image.image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.productImage.delete({ where: { id: imageId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET AI ORDERS ─────────────────────────────────────────
const getAIOrders = async (req, res) => {
    try {
        const orders = await prisma.aIOrder.findMany({
            where: { brand_id: req.user.id },
            include: { conversation: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET SINGLE AI ORDER WITH CHAT ─────────────────────────
const getAIOrderChat = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await prisma.aIOrder.findFirst({
            where: { id: orderId, brand_id: req.user.id },
            include: { conversation: true }
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const messages = order.conversation ? JSON.parse(order.conversation.messages || '[]') : [];
        res.json({ order, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET ALL CONVERSATIONS ─────────────────────────────────
const getConversations = async (req, res) => {
    try {
        const config = await prisma.aIBotConfig.findUnique({ where: { brand_id: req.user.id } });
        if (!config) return res.json([]);

        const conversations = await prisma.aIConversation.findMany({
            where: { bot_config_id: config.id },
            orderBy: { updated_at: 'desc' },
            take: 50
        });
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
