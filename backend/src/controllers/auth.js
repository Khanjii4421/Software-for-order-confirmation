const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const signup = async (req, res) => {
    const { brand_name, owner_name, email, phone, password, orders_per_day } = req.body;

    try {
        const brandExists = await prisma.brand.findUnique({
            where: { email },
        });

        if (brandExists) {
            return res.status(400).json({ message: 'Brand already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const brand = await prisma.brand.create({
            data: {
                brand_name,
                owner_name,
                email,
                phone,
                password_hash,
                orders_per_day,
                integrations: {
                    create: {} // Create an empty integration record
                }
            },
        });

        if (brand) {
            res.status(201).json({
                id: brand.id,
                brand_name: brand.brand_name,
                email: brand.email,
                token: generateToken(brand.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid brand data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const brand = await prisma.brand.findUnique({
            where: { email },
        });

        if (brand && (await bcrypt.compare(password, brand.password_hash))) {
            res.json({
                id: brand.id,
                brand_name: brand.brand_name,
                email: brand.email,
                token: generateToken(brand.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const brand = await prisma.brand.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                brand_name: true,
                owner_name: true,
                email: true,
                phone: true,
                orders_per_day: true,
                created_at: true,
            },
        });

        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    signup,
    login,
    getMe,
};
