const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { init, status, logout } = require('../controllers/whatsapp');

router.post('/init', authMiddleware, init);
router.get('/status', authMiddleware, status);
router.post('/logout', authMiddleware, logout);

module.exports = router;
