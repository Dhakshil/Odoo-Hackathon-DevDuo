const express = require('express');
const router = express.Router();
const db = require('../db');

// Check In
router.post('/check-in', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const now = new Date(); // ISO Date object

        // Upsert attendance record
        await db.query(
            `INSERT INTO attendance (user_id, date, check_in, status) 
             VALUES (?, ?, ?, 'present')
             ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = 'present'`,
            [userId, today, now]
        );

        const io = req.app.get('io');
        // Emit real-time event to teammate's frontend
        io.emit('attendance:updated', { 
            user_id: userId, 
            date: today, 
            check_in: now.toISOString(),
            status: 'present'
        });

        return res.success({ date: today, check_in: now.toISOString() }, 'Checked in successfully');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Check Out
router.post('/check-out', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        await db.query(
            `UPDATE attendance SET check_out = ? WHERE user_id = ? AND date = ?`,
            [now, userId, today]
        );

        const io = req.app.get('io');
        io.emit('attendance:updated', { 
            user_id: userId, 
            date: today, 
            check_out: now.toISOString()
        });

        return res.success({ date: today, check_out: now.toISOString() }, 'Checked out successfully');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Get Attendance (Own for Employee, All for HR)
router.get('/', async (req, res) => {
    try {
        let query = 'SELECT a.*, u.employee_id, u.email FROM attendance a JOIN users u ON a.user_id = u.id';
        let params = [];
        
        if (req.user.role === 'employee') {
            query += ' WHERE a.user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await db.query(query, params);
        
        // Format dates to ISO string for frontend teammate
        const formatted = rows.map(r => ({
            ...r,
            date: r.date ? new Date(r.date).toISOString() : null,
            check_in: r.check_in ? new Date(r.check_in).toISOString() : null,
            check_out: r.check_out ? new Date(r.check_out).toISOString() : null
        }));

        return res.success(formatted);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;