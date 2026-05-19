const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');
const CustomerModule = require('../modules/CustomerModule');

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
router.get('/profile', verifyToken, isCustomer, async (req, res, next) => {
    try {
        const profile = await CustomerModule.getProfile(req.user.id);
        res.json(profile);
    } catch (err) {
        next(err);
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
router.put('/profile', verifyToken, isCustomer, async (req, res, next) => {
    const { name, phone_number, default_address, password } = req.body;
    try {
        const result = await CustomerModule.updateProfile(req.user.id, name, phone_number, default_address, password);
        logActivity(req.user.id, 'Cập nhật hồ sơ khách hàng', 'info').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
