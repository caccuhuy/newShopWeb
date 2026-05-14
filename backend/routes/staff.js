const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const crypto = require('crypto');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

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
        const result = await pool.request().execute('vw_GetAllStaffs');
            
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
        

        // Hash default password '123456'
        const hash = crypto.createHash('sha256').update('123456').digest('hex');

        // Insert
        const result = await pool.request()
            .input('username', sql.NVarChar, name)
            .input('pasword_hash', sql.VarChar, hash)
            .input('email', sql.VarChar, email)
            .input('phone_number', sql.Char, phone_number)
            .input('role_name', sql.VarChar, role)
            .execute('sp_AddStaff');
            
        const newUserId = result.recordset[0].newUserId;
        await logActivity(req.user.id, `Tạo tài khoản mới: ${newUserId} (${name})`, 'success');
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
    const { is_active } = req.body;
    const targetId = req.params.id;
    const adminId = req.user.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('targetId', sql.VarChar, targetId)
            .input('adminId', sql.VarChar, adminId)
            .input('isActive', sql.Bit, is_active)
            .execute('sp_ToggleUserActive');

        const { username } = result.recordset[0];
        const action = is_active ? 'Mở khóa' : 'Khóa';

        await logActivity(adminId, `${action} tài khoản: ${username} (ID: ${targetId})`, is_active ? 'success' : 'warning');

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
            .execute('sp_ResetPassword');

        res.json({ message: 'Reset mật khẩu thành công' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
