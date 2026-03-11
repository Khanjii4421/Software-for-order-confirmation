const prisma = require('../db');
const fetch = require('node-fetch');

// ──────────────────────────────────────────────
// OpenAI Chat Completion
// ──────────────────────────────────────────────
const callOpenAI = async (apiKey, model, messages) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 500 })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
};

// ──────────────────────────────────────────────
// Send WhatsApp Text via Meta Cloud API
// ──────────────────────────────────────────────
const sendWAText = async (phoneNumberId, accessToken, to, text) => {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text }
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data;
};

// ──────────────────────────────────────────────
// Send WhatsApp Image via Meta Cloud API
// ──────────────────────────────────────────────
const sendWAImage = async (phoneNumberId, accessToken, to, imageUrl) => {
    // If imageUrl looks like a relative path (from local upload), skip sending image via API
    // In production this would be a publicly accessible URL
    if (!imageUrl.startsWith('http')) return;

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'image',
        image: { link: imageUrl }
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.error) console.error('Image send error:', data.error.message);
    return data;
};

// ──────────────────────────────────────────────
// Build AI System Prompt
// ──────────────────────────────────────────────
const buildSystemPrompt = (config, conversation) => {
    const personality = config.ai_personality || 'friendly';
    const productName = config.product_name || 'our product';
    const productDesc = config.product_description || 'a high quality product';
    const price = config.product_price ? `${config.currency || 'PKR'} ${config.product_price}` : 'ask for price';
    const minPrice = config.product_min_price ? `${config.currency || 'PKR'} ${config.product_min_price}` : price;
    const customPrompt = config.custom_prompt || '';

    return `You are a professional ${personality} WhatsApp sales agent for an online business. Your job is to sell products and collect customer orders.

PRODUCT INFORMATION:
- Product: ${productName}
- Description: ${productDesc}
- Price: ${price}
- Minimum price you can negotiate to: ${minPrice} (never go below this)

YOUR ROLE & BEHAVIOR:
- Behave like a real human sales representative, not a bot
- Be warm, friendly, and professional
- Speak naturally in the customer's language (Urdu/Roman Urdu or English, match what they use)
- Never reveal you are an AI

CONVERSATION FLOW (follow this order):
1. Greet customer warmly
2. Ask for their name (if not collected yet: current name = "${conversation.customer_name || 'not collected'}")
3. Tell them about the product with enthusiasm
4. Ask if they'd like to see product images or hear more details
5. Share the price confidently
6. If customer asks for discount: negotiate politely, you can reduce slightly but never below minimum price
7. Ask for their city (current city = "${conversation.city || 'not collected'}")
8. Ask for their delivery address (current address = "${conversation.address || 'not collected'}")
9. Confirm the order details and get their confirmation
10. Thank them warmly and say "Your order has been confirmed! ✅"

IMPORTANT RULES:
- When customer confirms the order, end your reply with exactly: [ORDER_CONFIRMED]
- When you send product images, include exactly: [SEND_IMAGES]
- Keep replies short and conversational (2-4 lines max)
- Use emojis naturally to seem human and friendly

CURRENT CONVERSATION STAGE: ${conversation.stage}
COLLECTED DATA: Name="${conversation.customer_name || ''}", City="${conversation.city || ''}", Address="${conversation.address || ''}"

${customPrompt ? `ADDITIONAL INSTRUCTIONS:\n${customPrompt}` : ''}`;
};

// ──────────────────────────────────────────────
// Extract data from AI conversation
// ──────────────────────────────────────────────
const extractConversationData = (messages, currentConv) => {
    // Simple extraction: look at the full conversation for name/city/address hints
    // In production you'd use NLP or structured prompts
    let name = currentConv.customer_name || null;
    let city = currentConv.city || null;
    let address = currentConv.address || null;

    // The AI is instructed to collect these; we parse them from the conversation context
    // Better approach: use a separate extraction call to OpenAI
    return { name, city, address };
};

// ──────────────────────────────────────────────
// Determine next conversation stage
// ──────────────────────────────────────────────
const determineStage = (currentStage, customerMsg, aiReply, convData) => {
    const msg = customerMsg.toLowerCase();

    if (aiReply.includes('[ORDER_CONFIRMED]')) return 'confirmed';

    // Progress through stages based on data collected
    if (!convData.customer_name) return 'collect_name';
    if (!convData.city) return 'collect_city';
    if (!convData.address) return 'collect_address';

    return 'negotiation_or_confirm';
};

// ──────────────────────────────────────────────
// Extract data from messages using a regex approach
// ──────────────────────────────────────────────
const parseCustomerDataFromMessages = async (config, messages) => {
    if (!config.openai_api_key || messages.length < 2) return {};

    try {
        const extractionPrompt = [
            {
                role: 'system',
                content: `Extract customer information from this WhatsApp conversation. Return a JSON object with these fields (null if not found): {"customer_name": string|null, "city": string|null, "address": string|null, "agreed_price": number|null}.
Only extract information the customer explicitly provided. Do not guess.`
            },
            {
                role: 'user',
                content: `Conversation:\n${messages.map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`).join('\n')}`
            }
        ];

        const result = await callOpenAI(config.openai_api_key, config.ai_model, extractionPrompt);
        // Parse JSON from response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error('Data extraction error:', e.message);
    }
    return {};
};

// ──────────────────────────────────────────────
// MAIN: Process incoming WhatsApp message
// ──────────────────────────────────────────────
const processIncomingMessage = async (phoneNumberId, customerPhone, customerMessage) => {
    // 1. Find the AI bot config for this phone number
    const config = await prisma.aIBotConfig.findFirst({
        where: { wa_phone_number_id: phoneNumberId, bot_enabled: true },
        include: { productImages: { orderBy: { display_order: 'asc' } } }
    });

    if (!config) {
        console.log(`[AI Agent] No active bot config for phoneId: ${phoneNumberId}`);
        return;
    }

    if (!config.openai_api_key) {
        console.log(`[AI Agent] No OpenAI API key configured`);
        return;
    }

    // 2. Get or create conversation session
    let conversation = await prisma.aIConversation.findFirst({
        where: { bot_config_id: config.id, customer_phone: customerPhone },
        orderBy: { updated_at: 'desc' }
    });

    // If conversation is completed, start a new one
    if (!conversation || conversation.stage === 'confirmed') {
        conversation = await prisma.aIConversation.create({
            data: {
                bot_config_id: config.id,
                customer_phone: customerPhone,
                stage: 'greeting',
                messages: JSON.stringify([])
            }
        });
    }

    // 3. Parse existing message history
    let messageHistory = JSON.parse(conversation.messages || '[]');

    // 4. Add customer message to history
    messageHistory.push({
        role: 'user',
        content: customerMessage,
        timestamp: new Date().toISOString()
    });

    // 5. Build messages for OpenAI
    const systemPrompt = buildSystemPrompt(config, conversation);
    const openAIMessages = [
        { role: 'system', content: systemPrompt },
        ...messageHistory.map(m => ({ role: m.role, content: m.content }))
    ];

    // 6. Call OpenAI
    let aiReply;
    try {
        aiReply = await callOpenAI(config.openai_api_key, config.ai_model, openAIMessages);
    } catch (err) {
        console.error('[AI Agent] OpenAI error:', err.message);
        return;
    }

    // 7. Check if AI wants to send images
    const shouldSendImages = aiReply.includes('[SEND_IMAGES]');
    const orderConfirmed = aiReply.includes('[ORDER_CONFIRMED]');

    // Clean the reply (remove special markers)
    const cleanReply = aiReply.replace('[SEND_IMAGES]', '').replace('[ORDER_CONFIRMED]', '').trim();

    // 8. Add AI reply to history
    messageHistory.push({
        role: 'assistant',
        content: cleanReply,
        timestamp: new Date().toISOString()
    });

    // 9. Extract customer data from full conversation
    const customerData = await parseCustomerDataFromMessages(config, messageHistory);
    const updatedName = customerData.customer_name || conversation.customer_name;
    const updatedCity = customerData.city || conversation.city;
    const updatedAddress = customerData.address || conversation.address;

    // 10. Determine new stage
    const newStage = orderConfirmed ? 'confirmed' : conversation.stage;

    // 11. Update conversation in DB
    await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: {
            messages: JSON.stringify(messageHistory),
            customer_name: updatedName,
            city: updatedCity,
            address: updatedAddress,
            stage: newStage,
            updated_at: new Date()
        }
    });

    // 12. Send reply via WhatsApp
    try {
        await sendWAText(config.wa_phone_number_id, config.wa_access_token, customerPhone, cleanReply);
    } catch (err) {
        console.error('[AI Agent] Failed to send WA text:', err.message);
        return;
    }

    // 13. Send product images if requested
    if (shouldSendImages && config.productImages.length > 0) {
        for (const img of config.productImages.slice(0, 3)) { // send max 3 images
            try {
                await sendWAImage(config.wa_phone_number_id, config.wa_access_token, customerPhone, img.image_url);
                await new Promise(r => setTimeout(r, 500)); // small delay between images
            } catch (e) {
                console.error('[AI Agent] Image send error:', e.message);
            }
        }
    }

    // 14. If order confirmed, create AI order record
    if (orderConfirmed) {
        const existingOrder = await prisma.aIOrder.findUnique({ where: { conversation_id: conversation.id } });

        if (!existingOrder) {
            const aiOrder = await prisma.aIOrder.create({
                data: {
                    brand_id: config.brand_id,
                    conversation_id: conversation.id,
                    customer_name: updatedName || 'Customer',
                    customer_phone: customerPhone,
                    city: updatedCity,
                    address: updatedAddress,
                    product_name: config.product_name,
                    product_image_url: config.productImages[0]?.image_url || null,
                    final_price: customerData.agreed_price || config.product_price,
                    status: 'confirmed'
                }
            });

            console.log(`[AI Agent] ✅ Order confirmed! ID: ${aiOrder.id}`);

            // Schedule confirmation message after 10 minutes
            setTimeout(async () => {
                try {
                    const confirmMsg = `✅ *Order Confirmed!*\n\nThank you ${updatedName || 'for your order'}! Your order has been successfully placed. Our team will contact you shortly for delivery confirmation.\n\n📦 Product: ${config.product_name || 'Your order'}\n💰 Price: ${config.currency || 'PKR'} ${customerData.agreed_price || config.product_price || 'TBD'}\n📍 City: ${updatedCity || 'TBD'}\n\nThank you for choosing us! 🙏`;

                    await sendWAText(config.wa_phone_number_id, config.wa_access_token, customerPhone, confirmMsg);

                    await prisma.aIOrder.update({
                        where: { id: aiOrder.id },
                        data: { confirmation_sent: true, confirmation_sent_at: new Date() }
                    });
                } catch (e) {
                    console.error('[AI Agent] Confirmation message error:', e.message);
                }
            }, 10 * 60 * 1000); // 10 minutes
        }

        // Emit socket event for real-time update
        // (io is available globally via app.get('io'))
    }

    console.log(`[AI Agent] Replied to ${customerPhone}: ${cleanReply.substring(0, 60)}...`);
};

// ──────────────────────────────────────────────
// Check if message is a product inquiry
// ──────────────────────────────────────────────
const isProductInquiry = (message) => {
    const triggers = ['price', 'show product', 'details', 'what is this', 'more information',
        'product', 'image', 'photo', 'pic', 'picture', 'rate', 'cost', 'qeemat', 'price?',
        'kya hai', 'bata', 'info', 'specification', 'spec'];
    const msg = message.toLowerCase();
    return triggers.some(t => msg.includes(t));
};

module.exports = { processIncomingMessage, sendWAText, isProductInquiry };
