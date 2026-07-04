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
            const [rawLeaves] = await db.query(`
                SELECT l.id, l.status, l.leave_type, l.start_date, u.employee_id, u.email 
                FROM leaves l JOIN users u ON l.user_id = u.id 
                ORDER BY l.created_at DESC LIMIT 5
            `);

            // Format to match frontend exactly
            const formattedActivities = rawLeaves.map(l => ({
                id: l.id,
                status: l.status,
                type: l.leave_type, // Frontend expects 'type'
                startDate: l.start_date ? new Date(l.start_date).toISOString().split('T')[0] : null, // Frontend expects 'startDate'
                user: {
                    name: l.email // Frontend expects 'user.name', we use email since we don't have a name field
                }
            }));

            return res.success({
                total_employees: totalEmployees[0].count,
                pending_leaves: pendingLeaves[0].count,
                present_today: presentToday[0].count,
                recent_activities: formattedActivities
            });
        } else {
            // Employee Dashboard Stats
            const [myLeaves] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE user_id = ?", [userId]);
            const [myPendingLeaves] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE user_id = ? AND status = 'pending'", [userId]);
            const [rawAttendance] = await db.query("SELECT status, date, check_in, check_out FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 5", [userId]);

            // Format to match frontend exactly
            const formattedAttendance = rawAttendance.map(r => ({
                date: r.date ? new Date(r.date).toLocaleDateString('en-CA') : null, // YYYY-MM-DD format
                check_in: r.check_in ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
                check_out: r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
                status: r.status
            }));

            return res.success({
                my_total_leaves: myLeaves[0].count,
                my_pending_leaves: myPendingLeaves[0].count,
                last_5_attendance_records: formattedAttendance // Frontend expects this exact key
            });
        }
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;