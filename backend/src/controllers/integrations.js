const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { processNewOrder } = require('../services/orderService');

const fetch = require('node-fetch');

const getIntegrations = async (req, res) => {
    try {
        const db = getDB();
        const integration = await db.collection('integrations').findOne(
            { brand_id: req.user.id },
            { projection: { _id: 0 } }
        );
        res.json(integration || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const authorizeShopify = async (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).json({ message: 'Shop domain is required' });

    const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`;
    const clientId = process.env.SHOPIFY_CLIENT_ID || 'dummy_client_id';
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/integrations/shopify/callback`;
    const scopes = 'read_orders,write_orders,read_products';
    
    // We store the current user ID in the state to retrieve it in the callback
    const state = req.user.id;

    const authorizeUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
    
    res.json({ url: authorizeUrl });
};

const shopifyCallback = async (req, res) => {
    const { shop, code, state } = req.query;
    const brandId = state;

    if (!shop || !code || !brandId) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const clientId = process.env.SHOPIFY_CLIENT_ID;
        const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

        // Exchange code for access token
        const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });

        const data = await response.json();
        const accessToken = data.access_token;

        if (!accessToken) {
            console.error('Shopify token exchange failed:', data);
            return res.status(400).send('Failed to obtain access token');
        }

        const db = getDB();
        
        // Save the shopify info
        await db.collection('integrations').updateOne(
            { brand_id: brandId },
            { 
                $set: { 
                    shopify_shop: shop,
                    shopify_api_key: accessToken, // Store as the key/token
                    shopify_connected_at: new Date()
                } 
            },
            { upsert: true }
        );

        // Automaticaly setup the webhook
        const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/integrations/shopify/orders/${brandId}`;
        
        await fetch(`https://${shop}/admin/api/2023-10/webhooks.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            },
            body: JSON.stringify({
                webhook: {
                    topic: 'orders/create',
                    address: webhookUrl,
                    format: 'json'
                }
            })
        });

        // Redirect back to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Send a self-closing popup page instead of redirecting
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shopify Connected</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      display: flex; align-items: center; justify-content: center;
      height: 100vh; text-align: center;
    }
    .card {
      background: white; border-radius: 24px; padding: 48px 40px;
      box-shadow: 0 24px 64px rgba(16, 185, 129, 0.15);
      max-width: 380px; width: 90%;
    }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 900; color: #065f46; margin-bottom: 8px; }
    p { font-size: 13px; color: #6b7280; font-weight: 500; line-height: 1.6; }
    .dot { display: inline-block; margin-top: 24px; width: 8px; height: 8px;
           background: #10b981; border-radius: 50%; animation: ping 1s infinite; }
    @keyframes ping { 0%, 100% { transform: scale(1); opacity: 1; }
                      50% { transform: scale(1.5); opacity: 0.6; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Shopify Connected!</h1>
    <p>Your store has been successfully linked.<br/>Webhooks are now active.</p>
    <br/><span class="dot"></span>
    <p style="margin-top:12px; font-size:11px; color:#9ca3af;">This window will close automatically...</p>
  </div>
  <script>
    // Close popup and signal parent to refresh
    setTimeout(() => {
      if (window.opener) window.opener.postMessage('shopify_connected', '${frontendUrl}');
      window.close();
    }, 2000);
  </script>
</body>
</html>`);
    } catch (error) {
        console.error('Shopify Callback Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

const authorizeWordpress = async (req, res) => {
    const { site } = req.query;
    if (!site) return res.status(400).json({ message: 'Site URL is required' });

    const siteUrl = site.startsWith('http') ? site : `https://${site}`;
    const brandId = req.user.id;
    const appName = 'OrderConfirm Automation';
    const successUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/integrations/wordpress/callback?brandId=${brandId}`;
    
    // WordPress Application Passwords Authorization URL
    const authorizeUrl = `${siteUrl}/wp-admin/authorize-application.php?app_name=${encodeURIComponent(appName)}&success_url=${encodeURIComponent(successUrl)}`;
    
    res.json({ url: authorizeUrl });
};

const wordpressCallback = async (req, res) => {
    const { brandId, user_login, password, site_url } = req.query;

    if (!brandId || !user_login || !password) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const db = getDB();
        
        // Save the wordpress info
        await db.collection('integrations').updateOne(
            { brand_id: brandId },
            { 
                $set: { 
                    wordpress_site_url: site_url,
                    wordpress_user: user_login,
                    wordpress_api_key: password, // The app password
                    wordpress_connected_at: new Date()
                } 
            },
            { upsert: true }
        );

        // Send a self-closing popup page instead of redirecting
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WordPress Connected</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      display: flex; align-items: center; justify-content: center;
      height: 100vh; text-align: center;
    }
    .card {
      background: white; border-radius: 24px; padding: 48px 40px;
      box-shadow: 0 24px 64px rgba(59, 130, 246, 0.15);
      max-width: 380px; width: 90%;
    }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 900; color: #1e3a8a; margin-bottom: 8px; }
    p { font-size: 13px; color: #6b7280; font-weight: 500; line-height: 1.6; }
    .dot { display: inline-block; margin-top: 24px; width: 8px; height: 8px;
           background: #3b82f6; border-radius: 50%; animation: ping 1s infinite; }
    @keyframes ping { 0%, 100% { transform: scale(1); opacity: 1; }
                      50% { transform: scale(1.5); opacity: 0.6; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔗</div>
    <h1>WordPress Linked!</h1>
    <p>Your WooCommerce store is now connected.<br/>Orders will sync automatically.</p>
    <br/><span class="dot"></span>
    <p style="margin-top:12px; font-size:11px; color:#9ca3af;">This window will close automatically...</p>
  </div>
  <script>
    // Close popup and signal parent to refresh
    setTimeout(() => {
      if (window.opener) window.opener.postMessage('wordpress_connected', '${frontendUrl}');
      window.close();
    }, 2000);
  </script>
</body>
</html>`);
    } catch (error) {
        console.error('WordPress Callback Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

const generateCustomKey = async (req, res) => {
    const custom_api_key = uuidv4();
    try {
        const db = getDB();
        await db.collection('integrations').updateOne(
            { brand_id: req.user.id },
            { $set: { custom_api_key } },
            { upsert: true }
        );
        res.json({ custom_api_key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const shopifyWebhook = async (req, res) => {
    const { brandId } = req.params;
    const orderData = req.body;

    try {
        const db = getDB();
        const brand = await db.collection('brands').findOne({ id: brandId });
        if (!brand) return res.status(404).send('Brand not found');
        if (!orderData || !orderData.id) return res.status(400).send('Invalid data');

        const customer = orderData.customer || {};
        const address = orderData.shipping_address || {};
        const lineItem = orderData.line_items?.[0] || {};

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
        const db = getDB();
        const brand = await db.collection('brands').findOne({ id: brandId });
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
    const { meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id, meta_template_name } = req.body;
    try {
        const db = getDB();
        await db.collection('integrations').updateOne(
            { brand_id: req.user.id },
            { $set: { meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id, meta_template_name } },
            { upsert: true }
        );
        const integration = await db.collection('integrations').findOne(
            { brand_id: req.user.id },
            { projection: { _id: 0 } }
        );
        res.json(integration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIntegrations,
    generateCustomKey,
    shopifyWebhook,
    wordpressWebhook,
    updateMeta,
    authorizeShopify,
    shopifyCallback,
    authorizeWordpress,
    wordpressCallback
};
