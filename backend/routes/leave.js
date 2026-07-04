const express = require('express');
const router = express.Router();
const db = require('../db');

// Apply for Leave
router.post('/', async (req, res) => {
    try {
        // Frontend sends camelCase, we map it to snake_case for DB
        const { type, startDate, endDate, remarks } = req.body;
        
        if (!type || !startDate || !endDate) {
            return res.error('VALIDATION_ERROR', ['Missing required fields']);
        }

        const [result] = await db.query(
            `INSERT INTO leaves (user_id, leave_type, start_date, end_date, remarks) 
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, type, startDate, endDate, remarks]
        );

        const [leave] = await db.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);
        
        // Return in the exact format the frontend expects
        return res.success({
            id: leave[0].id,
            type: leave[0].leave_type,
            startDate: leave[0].start_date ? new Date(leave[0].start_date).toISOString().split('T')[0] : null,
            endDate: leave[0].end_date ? new Date(leave[0].end_date).toISOString().split('T')[0] : null,
            status: leave[0].status,
            remarks: leave[0].remarks
        }, 'Leave request submitted');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Get Leaves (Own for Employee, All for HR)
router.get('/', async (req, res) => {
    try {
        let query = `
            SELECT l.*, u.name, u.employee_id, u.email 
            FROM leaves l JOIN users u ON l.user_id = u.id
        `;
        let params = [];
        
        if (req.user.role === 'employee') {
            query += ' WHERE l.user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await db.query(query, params);
        
        // Map to frontend expected keys
        const formatted = rows.map(r => ({
            id: r.id,
            type: r.leave_type,
            startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : null,
            endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : null,
            status: r.status,
            remarks: r.remarks,
            user: { name: r.name, employee_id: r.employee_id }
        }));

        return res.success(formatted);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Approve / Reject Leave (HR Only)
router.patch('/:id', async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.error('FORBIDDEN', ['Only HR can approve/reject leaves'], 403);
        }

        const { id } = req.params;
        const { status, admin_comment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.error('VALIDATION_ERROR', ['Status must be approved or rejected']);
        }

        await db.query(
            'UPDATE leaves SET status = ?, admin_comment = ? WHERE id = ?',
            [status, admin_comment || null, id]
        );

        const [leave] = await db.query('SELECT * FROM leaves WHERE id = ?', [id]);

        const io = req.app.get('io');
        // Emit real-time event to teammate's frontend
        io.emit('leave:updated', {
            ...leave[0],
            start_date: leave[0].start_date.toISOString(),
            end_date: leave[0].end_date.toISOString(),
            created_at: leave[0].created_at.toISOString()
        });

        return res.success(leave[0], `Leave ${status}`);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;