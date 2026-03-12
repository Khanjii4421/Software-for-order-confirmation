const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

// Meta Cloud API Logic
const sendMetaMessage = async (integration, order) => {
    const { meta_phone_number_id, meta_access_token, meta_template_name } = integration;
    const templateName = meta_template_name || 'order_confirmation';

    // Normalize phone number
    let phone = order.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('92') && phone.startsWith('03')) phone = '92' + phone.substring(1);

    const url = `https://graph.facebook.com/v18.0/${meta_phone_number_id}/messages`;

    const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'template',
        template: {
            name: templateName,
            language: { code: 'en_US' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: order.customer_name },
                        { type: 'text', text: order.order_number },
                        { type: 'text', text: integration.brand_name || 'Our Shop' }
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
        if (data.error) throw new Error(data.error.message);

        // Log message in DB
        const db = getDB();
        await db.collection('messages').insertOne({
            id: uuidv4(),
            order_id: order.id,
            phone: order.phone,
            message: `[Meta Template: ${templateName}]`,
            message_type: 'system',
            created_at: new Date()
        });

        return data;
    } catch (error) {
        console.error(`Meta API Error for brand ${order.brand_id}:`, error);
        throw error;
    }
};

const sendConfirmationMessage = async (order) => {
    try {
        const db = getDB();
        const integration = await db.collection('integrations').findOne({ brand_id: order.brand_id });

        if (integration && integration.meta_access_token && integration.meta_phone_number_id) {
            // Get brand name
            const brand = await db.collection('brands').findOne({ id: order.brand_id });
            const integrationWithBrand = { ...integration, brand_name: brand?.brand_name };

            console.log(`Sending via Meta Cloud API for brand ${order.brand_id}`);
            return await sendMetaMessage(integrationWithBrand, order);
        } else {
            console.log(`WhatsApp not configured for brand ${order.brand_id}`);
        }
    } catch (error) {
        console.error('sendConfirmationMessage Error:', error);
        // Don't throw — order should still be saved even if WhatsApp fails
    }
};

const getStatus = async (brandId) => {
    try {
        const db = getDB();
        const integration = await db.collection('integrations').findOne({ brand_id: brandId });
        if (integration && integration.meta_access_token && integration.meta_phone_number_id) {
            return { status: 'connected', type: 'meta' };
        }
    } catch (e) {}
    return { status: 'disconnected' };
};

module.exports = {
    sendConfirmationMessage,
    getStatus
};
