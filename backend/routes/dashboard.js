const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        if (role === 'hr') {
            // HR Dashboard Stats
            const [totalEmployees] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'employee'");
            const [pendingLeaves] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'");
            const [presentToday] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'present'");
            
            // Get recent 5 leave requests for HR feed
            const [recentLeaves] = await db.query(`
                SELECT l.id, l.status, l.leave_type, l.start_date, u.employee_id, u.email 
                FROM leaves l JOIN users u ON l.user_id = u.id 
                ORDER BY l.created_at DESC LIMIT 5
            `);

            return res.success({
                total_employees: totalEmployees[0].count,
                pending_leaves: pendingLeaves[0].count,
                present_today: presentToday[0].count,
                recent_activities: recentLeaves
            });
        } else {
            // Employee Dashboard Stats
            const [myLeaves] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE user_id = ?", [userId]);
            const [myPendingLeaves] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE user_id = ? AND status = 'pending'", [userId]);
            const [myAttendance] = await db.query("SELECT status, date FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 5", [userId]);

            return res.success({
                my_total_leaves: myLeaves[0].count,
                my_pending_leaves: myPendingLeaves[0].count,
                recent_activities: myAttendance
            });
        }
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;