const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./src/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded product images as static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OrderConfirm API is running' });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/integrations', require('./src/routes/integrations'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/brands', require('./src/routes/brands'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/whatsapp', require('./src/routes/whatsapp'));
app.use('/api/webhooks', require('./src/routes/webhooks'));
app.use('/api/ai-bot', require('./src/routes/aiBot'));

io.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id);
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
connectDB().then(() => {
    // Start cron service after DB is ready
    require('./src/services/cronService');

    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
