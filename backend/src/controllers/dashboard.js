const { getDB } = require('../db');

const getDashboardStats = async (req, res) => {
    try {
        const db = getDB();
        const brandId = req.user.id;
        const orders = db.collection('orders');

        const totalOrders = await orders.countDocuments({ brand_id: brandId });
        const confirmedOrders = await orders.countDocuments({ brand_id: brandId, status: 'confirmed' });
        const cancelledOrders = await orders.countDocuments({ brand_id: brandId, status: 'cancelled' });
        const pendingOrders = await orders.countDocuments({ brand_id: brandId, status: 'pending' });

        const confirmationRate = totalOrders > 0
            ? ((confirmedOrders / totalOrders) * 100).toFixed(2)
            : 0;

        res.json({
            totalOrders,
            confirmedOrders,
            cancelledOrders,
            pendingOrders,
            confirmationRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
