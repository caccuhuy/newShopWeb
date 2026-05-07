const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

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
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT l.*, u.username as [user], u.email
            FROM ActivityLogs l
            LEFT JOIN Users u ON TRIM(l.user_id) = TRIM(u.user_id)
            ORDER BY l.timestamp DESC
        `);
        console.log(`Fetched ${result.recordset.length} logs from DB`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching logs:', err.message);
        res.status(500).json({ error: err.message });
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
router.post('/', verifyToken, async (req, res) => {
    const { action, type } = req.body;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.VarChar, userId)
            .input('action', sql.NVarChar, action)
            .input('type', sql.VarChar, type || 'info')
            .query('INSERT INTO ActivityLogs (user_id, action, type) VALUES (@user_id, @action, @type)');
        res.status(201).json({ message: 'Log added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
