const express = require('express');
const router = express.Router();
const db = require('../db');

const getProfileHandler = async (req, res) => {
    try {
        const requestedUserId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
        if (req.user.role === 'employee' && requestedUserId !== req.user.id) {
            return res.error('FORBIDDEN', ['Unauthorized'], 403);
        }

        const [rows] = await db.query(
            `SELECT u.id, u.name, u.employee_id, u.email, u.role, p.phone, p.address, p.job_title, p.department, p.base_salary 
             FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?`, [requestedUserId]
        );

        if (rows.length === 0) return res.error('NOT_FOUND', ['User not found'], 404);
        return res.success(rows[0]);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
};

const updateProfileHandler = async (req, res) => {
    try {
        const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
        if (req.user.role === 'employee' && targetUserId !== req.user.id) return res.error('FORBIDDEN', ['Unauthorized'], 403);

        const { phone, address, job_title, department, base_salary } = req.body;
        await db.query(
            `UPDATE profiles SET phone = COALESCE(?, phone), address = COALESCE(?, address), 
             job_title = COALESCE(?, job_title), department = COALESCE(?, department), 
             base_salary = COALESCE(?, base_salary) WHERE user_id = ?`,
            [phone, address, job_title, department, base_salary, targetUserId]
        );

        const [updated] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [targetUserId]);
        return res.success(updated[0], 'Profile updated');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
};

router.get('/', getProfileHandler);
router.get('/:userId', getProfileHandler);
router.patch('/', updateProfileHandler);
router.patch('/:userId', updateProfileHandler);

module.exports = router;