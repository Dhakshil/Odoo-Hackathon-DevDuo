const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/employees (HR Only - Gets list of all employees)
router.get('/', async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.error('FORBIDDEN', ['Only HR can view all employees'], 403);
        }

        const [employees] = await db.query(`
            SELECT 
                u.id, u.employee_id, u.email, u.role,
                p.phone, p.job_title, p.department, p.base_salary
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'employee'
            ORDER BY u.employee_id ASC
        `);

        return res.success(employees);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;