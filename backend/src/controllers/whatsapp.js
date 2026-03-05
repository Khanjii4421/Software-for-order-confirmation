const { initializeClient, getStatus, logoutClient } = require('../services/whatsappService');

const init = async (req, res) => {
    try {
        const brandId = req.user.id;
        // We attach `null` as io to this function since websocket is better handled directly.
        // For simplicity, we just trigger init, the frontend can poll status via /status or WS.
        const result = await initializeClient(brandId, req.app.get('io'));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const status = async (req, res) => {
    try {
        const result = await getStatus(req.user.id, req.app.get('io'));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        await logoutClient(req.user.id);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { init, status, logout };
