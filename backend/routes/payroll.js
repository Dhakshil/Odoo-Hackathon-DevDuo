const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Payroll (Own payroll, or HR viewing someone else's)
const getPayrollHandler = async (req, res) => {
    try {
        const requestedUserId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
        
        if (req.user.role === 'employee' && requestedUserId !== req.user.id) {
            return res.error('FORBIDDEN', ['You can only view your own payroll'], 403);
        }

        const [rows] = await db.query(
            `SELECT user_id, base_salary FROM profiles WHERE user_id = ?`, 
            [requestedUserId]
        );

        if (rows.length === 0) return res.error('NOT_FOUND', ['Payroll data not found'], 404);
        
        return res.success(rows[0]);
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
};

// Define GET routes separately
router.get('/', getPayrollHandler);
router.get('/:userId', getPayrollHandler);


// Update Salary Structure (HR Only)
router.patch('/:userId', async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.error('FORBIDDEN', ['Only HR can update payroll'], 403);
        }

        const { userId } = req.params;
        const { base_salary } = req.body;

        if (base_salary === undefined || base_salary < 0) {
            return res.error('VALIDATION_ERROR', ['Valid base_salary is required']);
        }

        await db.query('UPDATE profiles SET base_salary = ? WHERE user_id = ?', [base_salary, userId]);

        const [updated] = await db.query('SELECT user_id, base_salary FROM profiles WHERE user_id = ?', [userId]);
        
        const io = req.app.get('io');
        io.emit('payroll:updated', updated[0]);

        return res.success(updated[0], 'Payroll updated successfully');
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;