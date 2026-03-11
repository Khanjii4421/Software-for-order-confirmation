const express = require('express');
const router = express.Router();
const prisma = require('../db');
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
        // Look up the verify token for any bot config
        const config = await prisma.aIBotConfig.findFirst({
            where: { wa_verify_token: token }
        });

        if (mode === 'subscribe' && config) {
            console.log('[AI Agent] Webhook verified!');
            res.status(200).send(challenge);
        } else if (mode === 'subscribe' && token === 'ai_bot_secret') {
            // Fallback
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// ─── AI Agent Webhook (POST) ───────────────────────────────────────────────
router.post('/ai-agent', async (req, res) => {
    // Immediately acknowledge receipt
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

        // Only handle text messages for now
        if (message.type === 'text' && message.text?.body) {
            const customerPhone = message.from;
            const customerMessage = message.text.body;

            console.log(`[AI Agent] Incoming from ${customerPhone}: ${customerMessage}`);

            // Process with AI agent (async, non-blocking)
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
            const phone = message.from; // Customer phone
            const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;

            // Handle button responses (Confirm/Cancel)
            if (message.type === 'button') {
                const payload = message.button.payload; // e.g. "CONFIRM_ORDER" or "CANCEL_ORDER"

                // Find the integration to know which brand this belongs to
                const integration = await prisma.integration.findFirst({
                    where: { meta_phone_number_id: phoneId }
                });

                if (integration) {
                    const brandId = integration.brand_id;

                    // Find latest pending order for this phone
                    const order = await prisma.order.findFirst({
                        where: {
                            brand_id: brandId,
                            phone: { contains: phone.slice(-10) }, // Matches last 10 digits
                            status: 'pending'
                        },
                        orderBy: { created_at: 'desc' }
                    });

                    if (order) {
                        if (payload === 'CONFIRM_ORDER' || payload === '✅ Confirm Order') {
                            await prisma.order.update({
                                where: { id: order.id },
                                data: { status: 'confirmed', confirmed_at: new Date() }
                            });
                        } else if (payload === 'CANCEL_ORDER' || payload === '❌ Cancel Order') {
                            await prisma.order.update({
                                where: { id: order.id },
                                data: { status: 'cancelled' }
                            });
                        }
                    }
                }
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
