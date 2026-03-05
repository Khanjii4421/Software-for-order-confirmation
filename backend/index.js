const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Start cron service
require('./src/services/cronService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io); // Attach io so we can use it in routes/services

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OrderConfirm API is running' });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/integrations', require('./src/routes/integrations'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/brands', require('./src/routes/brands'));
app.use('/api/whatsapp', require('./src/routes/whatsapp'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

io.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
