const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/logger');

// Login Endpoint
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Sai thông tin đăng nhập
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .execute('sp_LoginUser');
        
        const user = result.recordset[0];
        
        // Compute SHA-256 hash of the input password
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Compare with the DB hash (pasword_hash)
        if (hash.toLowerCase() !== user.pasword_hash.toLowerCase()) {
            return res.status(401).json({ message: 'Tài khoản sai mật khẩu hoặc không tồn tại' });
        }

        // Check if account is active
        if (user.is_active === false) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ Quản trị viên' });
        }

        // Generate JWT token
        const payload = { 
            id: user.user_id, 
            role: user.role_name 
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '8h' });
        
        // Return user info
        res.json({ 
            token, 
            user: { 
                id: user.user_id, 
                name: user.username, 
                role: user.role_name,
                email: user.email
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

// Register Endpoint
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản khách hàng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - fullname
 *               - email
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Tên đăng nhập đã tồn tại
 */
router.post('/register', async (req, res) => {
    const { name, email, password, phone_number, address } = req.body;

    if (!name || !email || !password || !phone_number || !address) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin (Họ tên, Email, Mật khẩu, Số điện thoại, Địa chỉ)' });
    }

    try {
        const pool = await poolPromise;
        
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        const result = await pool.request()
            .output('user_id', sql.VarChar(10))
            .input('username', sql.NVarChar, name)
            .input('email', sql.VarChar, email)
            .input('phone_number', sql.Char, phone_number)
            .input('default_address', sql.NVarChar, address)
            .input('pasword_hash', sql.VarChar, hash)
            .execute('sp_RegisterCustomer');

        const newUserId = result.recordset[0].newUserId;
        await logActivity(newUserId, `Khách hàng ${name} đăng ký tài khoản mới`, 'success');
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
