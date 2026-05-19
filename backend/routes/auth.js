const express = require('express');
const router = express.Router();
const AuthModule = require('../modules/AuthModule');
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
 *               - email
 *               - password
 *             properties:
 *               email:
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
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await AuthModule.login(email, password);
        res.json(result);
    } catch (err) {
        next(err);
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
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Tên đăng nhập đã tồn tại
 */
router.post('/register', async (req, res, next) => {
    const { name, email, password, phone_number, address } = req.body;
    try {
        const result = await AuthModule.register(name, email, password, phone_number, address);
        
        // Log activity
        logActivity(result.newUserId, `Khách hàng ${name} đăng ký tài khoản mới`, 'success').catch(console.error);
        
        res.status(201).json({ message: result.message });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
