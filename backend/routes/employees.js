const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        if (req.user.role !== 'hr') return res.error('FORBIDDEN', ['Only HR can view all employees'], 403);

        const [employees] = await db.query(`
            SELECT 
                u.id, u.name, u.employee_id, u.email, 
                p.phone, p.job_title, p.department, p.base_salary
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'employee'
            ORDER BY u.name ASC
        `);

        return res.success(employees);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;