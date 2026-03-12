const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { processIncomingMessage } = require('../services/aiAgentService');

// ─── Meta Webhook Verification (GET) ──────────────────────────────────────
router.get('/meta', (req, res) => {
    const verify_token = process.env.META_VERIFY_TOKEN || 'orderconfirm_secret';
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === verify_token) {
            console.log('META_WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// ─── AI Agent Webhook Verification (GET) ──────────────────────────────────
router.get('/ai-agent', async (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        try {
            const db = getDB();
            const config = await db.collection('ai_bot_configs').findOne({ wa_verify_token: token });

            if (mode === 'subscribe' && config) {
                console.log('[AI Agent] Webhook verified!');
                res.status(200).send(challenge);
            } else if (mode === 'subscribe' && token === 'ai_bot_secret') {
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        } catch (err) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

// ─── AI Agent Webhook (POST) ───────────────────────────────────────────────
router.post('/ai-agent', async (req, res) => {
    res.sendStatus(200);
    const body = req.body;
    if (!body.object) return;

    try {
        const entry = body.entry?.[0];
        if (!entry) return;
        const changes = entry.changes?.[0];
        if (!changes) return;
        const value = changes.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        const messages = value?.messages;
        if (!messages || messages.length === 0) return;
        const message = messages[0];

        if (message.type === 'text' && message.text?.body) {
            const customerPhone = message.from;
            const customerMessage = message.text.body;
            console.log(`[AI Agent] Incoming from ${customerPhone}: ${customerMessage}`);
            processIncomingMessage(phoneNumberId, customerPhone, customerMessage)
                .catch(err => console.error('[AI Agent] Processing error:', err.message));
        }
    } catch (err) {
        console.error('[AI Agent] Webhook error:', err.message);
    }
});

// ─── Meta Webhook Processing (POST) ──────────────────────────────────────
router.post('/meta', async (req, res) => {
    const body = req.body;

    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const message = body.entry[0].changes[0].value.messages[0];
            const phone = message.from;
            const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;

            if (message.type === 'button') {
                const payload = message.button.payload;

                try {
                    const db = getDB();
                    const integration = await db.collection('integrations').findOne({
                        meta_phone_number_id: phoneId
                    });

                    if (integration) {
                        const brandId = integration.brand_id;
                        const phoneLastTen = phone.slice(-10);

                        const order = await db.collection('orders').findOne({
                            brand_id: brandId,
                            phone: { $regex: phoneLastTen },
                            status: 'pending'
                        }, { sort: { created_at: -1 } });

                        if (order) {
                            if (payload === 'CONFIRM_ORDER' || payload === '✅ Confirm Order') {
                                await db.collection('orders').updateOne(
                                    { id: order.id },
                                    { $set: { status: 'confirmed', confirmed_at: new Date() } }
                                );
                            } else if (payload === 'CANCEL_ORDER' || payload === '❌ Cancel Order') {
                                await db.collection('orders').updateOne(
                                    { id: order.id },
                                    { $set: { status: 'cancelled' } }
                                );
                            }
                        }
                    }
                } catch (err) {
                    console.error('[Meta Webhook] Error processing button:', err.message);
                }
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
