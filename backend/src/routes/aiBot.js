const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middlewares/auth');
const {
    getBotConfig,
    saveBotConfig,
    toggleBot,
    uploadProductImage,
    deleteProductImage,
    getAIOrders,
    getAIOrderChat,
    getConversations,
    testOpenAI
} = require('../controllers/aiBot');

// ── Multer setup for product images ──────────────────────────
const uploadDir = path.join(__dirname, '../../public/uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const ext = path.extname(file.originalname);
        cb(null, `product-${unique}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        if (ok) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// ── Routes ───────────────────────────────────────────────────
router.get('/config', verifyToken, getBotConfig);
router.post('/config', verifyToken, saveBotConfig);
router.post('/toggle', verifyToken, toggleBot);
router.post('/upload-image', verifyToken, upload.single('image'), uploadProductImage);
router.delete('/image/:imageId', verifyToken, deleteProductImage);
router.get('/orders', verifyToken, getAIOrders);
router.get('/orders/:orderId/chat', verifyToken, getAIOrderChat);
router.get('/conversations', verifyToken, getConversations);
router.post('/test-openai', verifyToken, testOpenAI);

module.exports = router;
