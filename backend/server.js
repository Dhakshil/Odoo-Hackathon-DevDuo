const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (Will add these based on problem statement)
app.get('/api/health', (req, res) => res.json({ status: 'Backend is running!' }));

// Socket.io setup (Only if needed for real-time)
const io = new Server(server, {
    cors: { origin: "*" }
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
});
// Make io accessible to controllers
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));