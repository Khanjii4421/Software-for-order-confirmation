const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otpStore = new Map();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Step 1: Handle database query securely and prevent crashing
        try {
            const brandExists = await prisma.brand.findUnique({ where: { email } });
            if (brandExists) {
                return res.status(400).json({ success: false, message: 'Brand already exists with this email' });
            }
        } catch (dbError) {
            console.error("Database connection error:", dbError.message);
            return res.status(500).json({
                success: false,
                message: 'Database connection failed. Please ensure the local database file is accessible.'
            });
        }

        // Step 2: Generate secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 15 * 60 * 1000 }); // 15 mins expiry

        console.log(`\n================================`);
        console.log(`[DEV LOG] OTP FOR ${email} IS: ${otp}`);
        console.log(`================================\n`);

        // Step 3: Reliable Email Sending (Development / Production ready)
        const smtp_user = process.env.SMTP_USER?.trim();
        const smtp_pass = process.env.SMTP_PASS?.replace(/\s/g, ''); // Clear spaces from App Password

        let transporter;
        if (smtp_user && smtp_pass) {
            console.log(`[REAL MODE] Attempting to send email via Gmail from: ${smtp_user}`);
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // Gmail requires 465 for SSL or 587 for TLS
                auth: { user: smtp_user, pass: smtp_pass }
            });
        } else {
            console.log("\n[DEV MODE] Using Ethereal test account...");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
        }

        const info = await transporter.sendMail({
            from: `"OrderConfirm" <${smtp_user || 'no-reply@orderconfirm.com'}>`,
            to: email,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verify your Email Address</h2>
                    <p>Your 6-digit verification code is:</p>
                    <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 15 minutes.</p>
                </div>
            `
        });

        // Always log ethereal test preview link in dev environments!
        if (!process.env.SMTP_USER) {
            console.log(`📧 Test Email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
            console.log(`📧 Real email sent to: ${email}`);
        }

        return res.status(200).json({ success: true, message: 'Verification code sent successfully! Please check your email inbox.' });

    } catch (error) {
        console.error("sendOtp API Route Error - FULL LOG:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending email.',
            error: error.message,
            code: error.code // Log the code (e.g. EAUTH, ECONNREFUSED)
        });
    }
};

const signup = async (req, res) => {
    const { brand_name, owner_name, email, phone, password, orders_per_day, otp } = req.body;

    try {
        // Validate OTP
        if (!otp) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        const stored = otpStore.get(email);
        if (!stored || stored.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'Verification code has expired' });
        }

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

        otpStore.delete(email); // Clean up used OTP

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

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    const { accessToken, isSignUp } = req.body;
    try {
        // Fetch user info using the access token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const payload = await response.json();

        if (!payload.email) {
            return res.status(400).json({ message: "Invalid Google token" });
        }

        const email = payload.email;
        let brand = await prisma.brand.findUnique({ where: { email } });

        if (isSignUp) {
            if (brand) {
                return res.status(400).json({ message: 'Brand already exists with this email. Please login.' });
            }

            // Create new user via Google
            const generatedPassword = Math.random().toString(36).slice(-10);
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(generatedPassword, salt);

            brand = await prisma.brand.create({
                data: {
                    brand_name: payload.name || "My Brand",
                    owner_name: payload.given_name || payload.name,
                    email: email,
                    phone: "N/A", // Google doesn't always provide phone
                    password_hash,
                    orders_per_day: "1-50",
                    integrations: { create: {} }
                },
            });
        } else {
            // Login flow
            if (!brand) {
                return res.status(400).json({ message: 'Account not found. Please sign up first.' });
            }
        }

        res.json({
            id: brand.id,
            brand_name: brand.brand_name,
            email: brand.email,
            token: generateToken(brand.id),
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Google authentication failed" });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    sendOtp,
    googleAuth,
};
