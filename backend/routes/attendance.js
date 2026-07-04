// GET /api/attendance
router.get('/', async (req, res) => {
    try {
        let query = 'SELECT a.*, u.employee_id, u.email FROM attendance a JOIN users u ON a.user_id = u.id';
        let params = [];
        
        if (req.user.role === 'employee') {
            query += ' WHERE a.user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await db.query(query, params);
        
        const formatted = rows.map(r => ({
            ...r,
            // FIX: Format date to YYYY-MM-DD so frontend can match it easily
            date: r.date ? new Date(r.date).toISOString().split('T')[0] : null,
            check_in: r.check_in ? new Date(r.check_in).toISOString() : null,
            check_out: r.check_out ? new Date(r.check_out).toISOString() : null
        }));

        return res.success(formatted);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// POST /api/attendance/check-out
router.post('/check-out', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        // FIX: Use ON DUPLICATE KEY UPDATE so it works even if check-in was missed
        await db.query(
            `INSERT INTO attendance (user_id, date, check_out, status) 
             VALUES (?, ?, ?, 'present')
             ON DUPLICATE KEY UPDATE check_out = VALUES(check_out)`,
            [userId, today, now]
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