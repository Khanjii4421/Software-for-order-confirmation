const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/orderconfirm';

let client;
let db;

const connectDB = async () => {
    if (db) return db;
    try {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db();
        console.log('✅ MongoDB connected successfully');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) throw new Error('Database not initialized. Call connectDB() first.');
    return db;
};

module.exports = { connectDB, getDB };
