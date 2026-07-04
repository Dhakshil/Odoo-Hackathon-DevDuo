const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign Up
router.post('/signup', async (req, res, next) => {
    try {
        const { employee_id, email, password, role } = req.body;
        
        if (!employee_id || !email || !password) {
            return res.error('VALIDATION_ERROR', ['Missing required fields']);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create User
        const [result] = await db.query(
            'INSERT INTO users (employee_id, email, password, role) VALUES (?, ?, ?, ?)',
            [employee_id, email, hashedPassword, role || 'employee']
        );
        
        // Create Empty Profile
        await db.query('INSERT INTO profiles (user_id) VALUES (?)', [result.insertId]);

        const token = jwt.sign({ id: result.insertId, role: role || 'employee' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.success({ token, user: { id: result.insertId, employee_id, email, role: role || 'employee' } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.error('DUPLICATE_ENTRY', ['Email or Employee ID already exists']);
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

// Sign In
router.post('/signin', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) return res.error('NOT_FOUND', ['User not found'], 404);
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.error('INVALID_CREDENTIALS', ['Incorrect password']);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        return res.success({ 
            token, 
            user: { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role } 
        });
    } catch (err) {
        return res.error('SERVER_ERROR', [err.message], 500);
    }
});

module.exports = router;