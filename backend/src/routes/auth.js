const express = require('express');
const router = express.Router();
const { signup, login, getMe, googleAuth } = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authMiddleware, getMe);

module.exports = router;
