const express = require('express');
const router = express.Router();
const {
    getIntegrations,
    updateShopify,
    updateWordpress,
    generateCustomKey,
    shopifyWebhook,
    wordpressWebhook,
    updateMeta
} = require('../controllers/integrations');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getIntegrations);
router.put('/shopify', authMiddleware, updateShopify);
router.put('/wordpress', authMiddleware, updateWordpress);
router.put('/meta', authMiddleware, updateMeta);
router.post('/custom-key', authMiddleware, generateCustomKey);

// Webhooks (No auth middleware as they are called by external platforms)
// Using identifier in URL to identify the brand
router.post('/shopify/orders/:brandId', shopifyWebhook);
router.post('/wordpress/orders/:brandId', wordpressWebhook);

module.exports = router;
