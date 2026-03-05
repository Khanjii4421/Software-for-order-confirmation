const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDemoUser() {
    console.log("Deleting demo user...");
    try {
        const brand = await prisma.brand.findUnique({
            where: { email: 'demo@example.com' }
        });

        if (brand) {
            // Must delete related tables first due to foreign keys, or cascading setup
            await prisma.integration.deleteMany({ where: { brand_id: brand.id } });
            await prisma.message.deleteMany({ where: { order: { brand_id: brand.id } } });
            await prisma.order.deleteMany({ where: { brand_id: brand.id } });
            await prisma.brand.delete({ where: { id: brand.id } });
            console.log("Demo user deleted successfully.");
        } else {
            console.log("Demo user not found.");
        }
    } catch (error) {
        console.error("Error deleting demo user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteDemoUser();
