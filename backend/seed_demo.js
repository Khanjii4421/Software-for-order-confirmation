const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'demo@example.com';
    const password = 'password123';

    let brand = await prisma.brand.findUnique({ where: { email } });

    if (!brand) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        brand = await prisma.brand.create({
            data: {
                brand_name: 'Demo Brand',
                owner_name: 'Demo Owner',
                email,
                phone: '+923000000000',
                password_hash,
                orders_per_day: '1-50',
                integrations: {
                    create: {}
                }
            }
        });
    }

    console.log("=== ACCOUNT CREATED ===");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Webhook URL: http://localhost:5000/api/integrations/wordpress/orders/${brand.id}`);
    console.log("=======================");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
