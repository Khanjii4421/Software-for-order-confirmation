const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
    const { brand_name, owner_name, email, phone, password, orders_per_day } = req.body;

    if (!brand_name || !owner_name || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const db = getDB();
        const brands = db.collection('brands');

        // Check if email already exists
        const existingBrand = await brands.findOne({ email });
        if (existingBrand) {
            return res.status(400).json({ message: 'Brand already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const brandId = uuidv4();

        const newBrand = {
            id: brandId,
            brand_name,
            owner_name,
            email,
            phone,
            password_hash,
            orders_per_day: orders_per_day || '1-50',
            created_at: new Date(),
        };

        await brands.insertOne(newBrand);

        // Create empty integration record for this brand
        const integrations = db.collection('integrations');
        await integrations.insertOne({
            id: uuidv4(),
            brand_id: brandId,
            shopify_api_key: null,
            wordpress_webhook: null,
            custom_api_key: null,
            whatsapp_connected: false,
            meta_app_id: null,
            meta_phone_number_id: null,
            meta_access_token: null,
            meta_business_account_id: null,
            meta_template_name: null,
            created_at: new Date()
        });

        return res.status(201).json({
            id: brandId,
            brand_name,
            email,
            token: generateToken(brandId),
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const db = getDB();
        const brand = await db.collection('brands').findOne({ email });

        if (!brand) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, brand.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json({
            id: brand.id,
            brand_name: brand.brand_name,
            email: brand.email,
            token: generateToken(brand.id),
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const db = getDB();
        const brand = await db.collection('brands').findOne(
            { id: req.user.id },
            { projection: { password_hash: 0, _id: 0 } }
        );

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        return res.json(brand);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ─── GOOGLE AUTH ──────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
    const { accessToken, isSignUp } = req.body;
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const payload = await response.json();

        if (!payload.email) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const db = getDB();
        const brands = db.collection('brands');
        const email = payload.email;
        let brand = await brands.findOne({ email });

        if (isSignUp) {
            if (brand) {
                return res.status(400).json({ message: 'Brand already exists with this email. Please login.' });
            }

            const generatedPassword = Math.random().toString(36).slice(-10);
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(generatedPassword, salt);
            const brandId = uuidv4();

            brand = {
                id: brandId,
                brand_name: payload.name || 'My Brand',
                owner_name: payload.given_name || payload.name,
                email,
                phone: 'N/A',
                password_hash,
                orders_per_day: '1-50',
                created_at: new Date()
            };

            await brands.insertOne(brand);

            // Create integration record
            const integrations = db.collection('integrations');
            await integrations.insertOne({
                id: uuidv4(),
                brand_id: brandId,
                whatsapp_connected: false,
                created_at: new Date()
            });
        } else {
            if (!brand) {
                return res.status(400).json({ message: 'Account not found. Please sign up first.' });
            }
        }

        return res.json({
            id: brand.id,
            brand_name: brand.brand_name,
            email: brand.email,
            token: generateToken(brand.id),
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ message: 'Google authentication failed' });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    googleAuth,
};
