const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 1. Strict CORS for teammate's frontend
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

// 2. Socket.io setup
const io = new Server(server, {
    cors: { origin: 'http://127.0.0.1:5500', methods: ['GET', 'POST', 'PATCH'] }
});
io.on('connection', (socket) => {
    console.log('Frontend connected via Socket:', socket.id);
});
// Make io available to controllers
app.set('io', io);

// 3. Standard Response Formatter (Teammate Requirement)
app.use((req, res, next) => {
    res.success = (data, message = 'Success') => res.json({ success: true, data, message });
    res.error = (code, details, statusCode = 400) => res.status(statusCode).json({ success: false, error: { code, details } });
    next();
});

// 4. Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.error('UNAUTHORIZED', ['No token provided'], 401);
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.error('INVALID_TOKEN', ['Invalid or expired token'], 401);
    }
};

// Import Routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const profileRoutes = require('./routes/profile');
const payrollRoutes = require('./routes/payroll');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/leaves', authMiddleware, leaveRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/payroll', authMiddleware, payrollRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

app.get('/api/health', (req, res) => res.success({ status: 'running' }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on ${PORT}`));