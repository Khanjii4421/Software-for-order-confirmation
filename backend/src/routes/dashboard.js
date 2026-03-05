const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/dashboard');

router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
