const express = require('express');
const router = express.Router();
const db = require('../db');

// Apply for Leave
router.post('/', async (req, res) => {
    try {
        const { leave_type, start_date, end_date, remarks } = req.body;
        
        if (!leave_type || !start_date || !end_date) {
            return res.error('VALIDATION_ERROR', ['Missing required fields']);
        }

        const [result] = await db.query(
            `INSERT INTO leaves (user_id, leave_type, start_date, end_date, remarks) 
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, leave_type, start_date, end_date, remarks]
        );

        const [leave] = await db.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);
        
        return res.success({
            ...leave[0],
            start_date: leave[0].start_date.toISOString(),
            end_date: leave[0].end_date.toISOString(),
            created_at: leave[0].created_at.toISOString()
        }, 'Leave request submitted');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Get Leaves (Own for Employee, All for HR)
router.get('/', async (req, res) => {
    try {
        let query = 'SELECT l.*, u.employee_id, u.email FROM leaves l JOIN users u ON l.user_id = u.id';
        let params = [];
        
        if (req.user.role === 'employee') {
            query += ' WHERE l.user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await db.query(query, params);
        
        const formatted = rows.map(r => ({
            ...r,
            start_date: r.start_date ? new Date(r.start_date).toISOString() : null,
            end_date: r.end_date ? new Date(r.end_date).toISOString() : null,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : null
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