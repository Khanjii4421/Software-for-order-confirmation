const { getDB } = require('../db');

const getAdminDashboard = async (req, res) => {
    try {
        const db = getDB();
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@orderconfirm.com';

        const user = await db.collection('brands').findOne({ id: req.user.id });
        if (!user || user.email !== adminEmail) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const totalBrands = await db.collection('brands').countDocuments();
        const totalOrders = await db.collection('orders').countDocuments();
        const confirmedOrders = await db.collection('orders').countDocuments({ status: 'confirmed' });
        const globalConfirmationRate = totalOrders > 0
            ? ((confirmedOrders / totalOrders) * 100).toFixed(2)
            : 0;

        const brandsData = await db.collection('brands')
            .find({}, { projection: { id: 1, brand_name: 1, _id: 0 } })
            .toArray();

        const brandList = await Promise.all(brandsData.map(async (brand) => {
            const ordersCount = await db.collection('orders').countDocuments({ brand_id: brand.id });
            const confOrders = await db.collection('orders').countDocuments({ brand_id: brand.id, status: 'confirmed' });
            return {
                brand_name: brand.brand_name,
                total_orders: ordersCount,
                confirmation_rate: ordersCount > 0 ? ((confOrders / ordersCount) * 100).toFixed(2) : 0
            };
        }));

        res.json({
            totalBrands,
            totalOrders,
            globalConfirmationRate,
            brandList
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminDashboard };
