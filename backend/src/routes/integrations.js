const express = require('express');
const router = express.Router();
const {
    getIntegrations,
    generateCustomKey,
    shopifyWebhook,
    wordpressWebhook,
    updateMeta,
    authorizeShopify,
    shopifyCallback,
    authorizeWordpress,
    wordpressCallback
} = require('../controllers/integrations');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getIntegrations);

// Shopify OAuth flow
router.get('/shopify/authorize', authMiddleware, authorizeShopify);
router.get('/shopify/callback', shopifyCallback);
router.post('/shopify/orders/:brandId', shopifyWebhook); // webhook from Shopify

// WordPress OAuth flow
router.get('/wordpress/authorize', authMiddleware, authorizeWordpress);
router.get('/wordpress/callback', wordpressCallback);
router.post('/wordpress/orders/:brandId', wordpressWebhook); // webhook from WooCommerce

// Other integrations
router.put('/meta', authMiddleware, updateMeta);
router.post('/custom-key', authMiddleware, generateCustomKey);

module.exports = router;
