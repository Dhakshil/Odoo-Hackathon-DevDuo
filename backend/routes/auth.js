const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'odoo_hackathon_super_secret';
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

router.post('/signup', async (req, res) => {
    try {
        const { name, employee_id, email, password, role } = req.body;
        if (!employee_id || !email || !password) return res.error('VALIDATION_ERROR', ['Missing required fields']);

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        
        const [result] = await db.query(
            'INSERT INTO users (name, employee_id, email, password, role, otp_code) VALUES (?, ?, ?, ?, ?, ?)',
            [name || 'User', employee_id, email, hashedPassword, role || 'employee', otp]
        );
        
        // GIVE DEFAULT SALARY AND JOB TITLE SO PAYROLL ISN'T ZERO
        await db.query(
            'INSERT INTO profiles (user_id, base_salary, job_title, department) VALUES (?, 55000, "Software Developer", "Engineering")',
            [result.insertId]
        );

        return res.success({ otp, message: "Signup successful." });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.error('DUPLICATE_ENTRY', ['Email or Employee ID already exists']);
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.error('NOT_FOUND', ['User not found'], 404);

        if (users[0].otp_code !== otp) return res.error('INVALID_OTP', ['Incorrect OTP code']);

        await db.query('UPDATE users SET is_verified = TRUE, otp_code = NULL WHERE id = ?', [users[0].id]);
        return res.success({ message: "Email verified. You can now login." });
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.error('NOT_FOUND', ['User not found'], 404);
        
        const user = users[0];
        if (!user.is_verified) return res.error('NOT_VERIFIED', ['Please verify your email first'], 403);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.error('INVALID_CREDENTIALS', ['Incorrect password']);

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return res.success({ 
            token, 
            user: { id: user.id, name: user.name, employee_id: user.employee_id, email: user.email, role: user.role } 
        });
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;