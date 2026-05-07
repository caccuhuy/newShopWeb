const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Customer Profile
 *   description: Quản lý thông tin cá nhân khách hàng
 */

/**
 * @swagger
 * /api/customers/profile:
 *   get:
 *     summary: Lấy thông tin hồ sơ của khách hàng hiện tại
 *     tags: [Customer Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin hồ sơ
 */
// Get customer profile
router.get('/profile', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, req.user.id)
            .query(`
                SELECT user_id, username, email, phone_number, default_address, role_name, is_active
                FROM Users
                WHERE user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Customer profile error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy thông tin khách hàng' });
    }
});

/**
 * @swagger
 * /api/customers/profile:
 *   put:
 *     summary: Cập nhật hồ sơ khách hàng
 *     tags: [Customer Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               default_address:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: (Tùy chọn) Mật khẩu mới nếu muốn thay đổi
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update customer profile
router.put('/profile', verifyToken, isCustomer, async (req, res) => {
    const { name, phone_number, default_address, password } = req.body;
    if (!name || !phone_number || !default_address) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin hồ sơ' });
    }

    try {
        const pool = await poolPromise;
        const updateRequest = pool.request()
            .input('userId', sql.VarChar, req.user.id)
            .input('username', sql.NVarChar, name)
            .input('phone', sql.Char, phone_number)
            .input('address', sql.NVarChar, default_address);

        let updateQuery = `
            UPDATE Users
            SET username = @username,
                phone_number = @phone,
                default_address = @address
            WHERE user_id = @userId
        `;

        if (password) {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            updateRequest.input('passwordHash', sql.VarChar, hash);
            updateQuery = `
                UPDATE Users
                SET username = @username,
                    phone_number = @phone,
                    default_address = @address,
                    pasword_hash = @passwordHash
                WHERE user_id = @userId
            `;
        }

        await updateRequest.query(updateQuery);

        await logActivity(req.user.id, 'Cập nhật hồ sơ khách hàng', 'info');
        res.json({ message: 'Cập nhật hồ sơ thành công' });
    } catch (err) {
        console.error('Update customer profile error:', err);
        res.status(500).json({ error: 'Lỗi server khi cập nhật hồ sơ khách hàng' });
    }
});

module.exports = router;
