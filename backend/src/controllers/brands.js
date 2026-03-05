const prisma = require('../db');

const getAdminDashboard = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@orderconfirm.com';

        // Auth check for admin
        if (req.user.email && req.user.email !== adminEmail) {
            // In a real app we'd retrieve user to check email.
            // We stored only ID in jwt `req.user.id`. Let's fetch the actual user. 
            const user = await prisma.brand.findUnique({ where: { id: req.user.id } });
            if (user.email !== adminEmail) {
                return res.status(403).json({ message: 'Not authorized as admin' });
            }
        }

        const totalBrands = await prisma.brand.count();
        const totalOrders = await prisma.order.count();
        const confirmedOrders = await prisma.order.count({ where: { status: 'confirmed' } });
        const globalConfirmationRate = totalOrders > 0 ? ((confirmedOrders / totalOrders) * 100).toFixed(2) : 0;

        // Get brand list with their stats
        const brandsData = await prisma.brand.findMany({
            select: {
                id: true,
                brand_name: true,
                orders: {
                    select: { status: true }
                }
            }
        });

        const brandList = brandsData.map(brand => {
            const ordersCount = brand.orders.length;
            const confOrders = brand.orders.filter(o => o.status === 'confirmed').length;
            return {
                brand_name: brand.brand_name,
                total_orders: ordersCount,
                confirmation_rate: ordersCount > 0 ? ((confOrders / ordersCount) * 100).toFixed(2) : 0
            };
        });

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
