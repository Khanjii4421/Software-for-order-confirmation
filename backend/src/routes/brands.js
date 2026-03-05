const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getAdminDashboard } = require('../controllers/brands');

// Ideally this should use an adminMiddleware, we'll basic check here for simplicity based on email
router.get('/admin', authMiddleware, getAdminDashboard);

module.exports = router;
