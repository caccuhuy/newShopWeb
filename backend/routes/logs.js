const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const LogModule = require('../modules/LogModule');

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Nhật ký hoạt động hệ thống (Admin)
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Lấy danh sách nhật ký hoạt động
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhật ký
 */
// Get all activity logs (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const logs = await LogModule.getAll();
        res.json(logs);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Thêm một nhật ký hoạt động mới
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, danger]
 *     responses:
 *       201:
 *         description: Thêm nhật ký thành công
 */
// Add a new activity log
router.post('/', verifyToken, async (req, res, next) => {
    const { action, type } = req.body;
    try {
        const result = await LogModule.create(req.user.id, action, type);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
