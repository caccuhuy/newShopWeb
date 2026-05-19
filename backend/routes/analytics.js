const express = require('express');
const router = express.Router();
const { verifyToken, isStaff } = require('../middleware/authMiddleware');
const AnalyticsModule = require('../modules/AnalyticsModule');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Báo cáo và thống kê
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Lấy dữ liệu thống kê tổng quan cho Dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Số ngày gần nhất để lấy dữ liệu biểu đồ doanh thu
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê bao gồm KPI, biểu đồ và hàng sắp hết
 */
// Get Dashboard Stats
router.get('/dashboard', verifyToken, isStaff, async (req, res, next) => {
    try {
        const stats = await AnalyticsModule.getDashboardStats(req.query.days);
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/analytics/low-stock:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm sắp hết hàng
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm có tồn kho thấp
 */
// Get All Low Stock Products
router.get('/low-stock', verifyToken, isStaff, async (req, res, next) => {
    try {
        const lowStock = await AnalyticsModule.getAllLowStock();
        res.json(lowStock);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
