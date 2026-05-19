const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const StaffModule = require('../modules/StaffModule');

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
router.get('/', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const staff = await StaffModule.getAll();
        res.json(staff);
    } catch (err) {
        next(err);
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
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
    const { name, email, phone_number, role } = req.body;
    try {
        const result = await StaffModule.create(name, email, phone_number, role);
        logActivity(req.user.id, `Tạo tài khoản mới: ${result.newUserId} (${name})`, 'success').catch(console.error);
        res.status(201).json({ message: result.message });
    } catch (err) {
        next(err);
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
router.put('/:id/status', verifyToken, isAdmin, async (req, res, next) => {
    const { is_active } = req.body;
    try {
        const result = await StaffModule.toggleActive(req.params.id, req.user.id, is_active);
        const action = is_active ? 'Mở khóa' : 'Khóa';
        logActivity(req.user.id, `${action} tài khoản: ${result.username} (ID: ${req.params.id})`, is_active ? 'success' : 'warning').catch(console.error);
        res.json({ message: result.message });
    } catch (err) {
        next(err);
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
router.put('/:id/reset-password', verifyToken, isAdmin, async (req, res, next) => {
    const { password } = req.body;
    try {
        const result = await StaffModule.resetPassword(req.params.id, password);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
