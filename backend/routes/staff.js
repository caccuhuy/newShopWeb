const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const crypto = require('crypto');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Quản lý nhân viên (Admin)
 */

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Lấy danh sách nhân viên
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 */
// Get all staff and admins
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query("SELECT user_id, username, email, phone_number, role_name, is_active FROM Users WHERE role_name IN ('Staff', 'Admin')");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching staff:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Thêm nhân viên mới
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Staff, Admin]
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
// Create a new staff/admin
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { name, email, phone_number, role } = req.body;

    if (!name || !email || !phone_number || !role) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    try {
        const pool = await poolPromise;
        
        // 1. Check if email exists
        const checkEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT 1 FROM Users WHERE email = @email');
            
        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống!' });
        }

        // 1b. Check if phone number exists
        const checkPhone = await pool.request()
            .input('phone_number', sql.Char, phone_number)
            .query('SELECT 1 FROM Users WHERE phone_number = @phone_number');
            
        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ message: 'Số điện thoại này đã tồn tại trong hệ thống!' });
        }

        // 2. Generate user_id
        const idResult = await pool.request().query('SELECT MAX(CAST(user_id AS INT)) as maxId FROM Users');
        let nextIdNum = 1;
        if (idResult.recordset[0].maxId != null) {
            nextIdNum = idResult.recordset[0].maxId + 1;
        }
        const newUserId = nextIdNum.toString().padStart(4, '0');

        // 3. Hash default password '123456'
        const hash = crypto.createHash('sha256').update('123456').digest('hex');

        // 4. Insert
        await pool.request()
            .input('user_id', sql.VarChar, newUserId)
            .input('username', sql.NVarChar, name)
            .input('pasword_hash', sql.VarChar, hash)
            .input('email', sql.VarChar, email)
            .input('phone_number', sql.Char, phone_number)
            .input('role_name', sql.VarChar, role)
            .query(`
                INSERT INTO Users (user_id, username, pasword_hash, email, phone_number, role_name, is_active)
                VALUES (@user_id, @username, @pasword_hash, @email, @phone_number, @role_name, 1)
            `);

        res.status(201).json({ message: 'Thêm nhân viên thành công' });
    } catch (err) {
        console.error('Error creating staff:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

/**
 * @swagger
 * /api/staff/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái hoạt động của nhân viên
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Toggle staff status
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
        const pool = await poolPromise;

        // Prevent self-lock
        const userCheck = await pool.request()
            .input('user_id', sql.VarChar, id)
            .query('SELECT email FROM Users WHERE user_id = @user_id');
            
        if (userCheck.recordset.length > 0 && userCheck.recordset[0].email === req.user.email) {
            return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình!' });
        }

        await pool.request()
            .input('user_id', sql.VarChar, id)
            .input('is_active', sql.Bit, is_active)
            .query('UPDATE Users SET is_active = @is_active WHERE user_id = @user_id');

        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

/**
 * @swagger
 * /api/staff/{id}/reset-password:
 *   put:
 *     summary: Reset mật khẩu cho nhân viên
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset thành công
 */
// Reset password
router.put('/:id/reset-password', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Mật khẩu không được để trống' });

    try {
        const pool = await poolPromise;
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        await pool.request()
            .input('user_id', sql.VarChar, id)
            .input('hash', sql.VarChar, hash)
            .query('UPDATE Users SET pasword_hash = @hash WHERE user_id = @user_id');

        res.json({ message: 'Reset mật khẩu thành công' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
