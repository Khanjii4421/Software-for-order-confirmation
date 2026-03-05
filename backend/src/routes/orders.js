const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getOrders, getConfirmedOrders, createCustomOrder } = require('../controllers/orders');

router.get('/', authMiddleware, getOrders);
router.get('/confirmed', authMiddleware, getConfirmedOrders);

// Custom API - Requires API key
router.post('/create', createCustomOrder);

module.exports = router;
