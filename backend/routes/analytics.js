const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin, isStaff } = require('../middleware/authMiddleware');

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
router.get('/dashboard', verifyToken, isStaff, async (req, res) => {
    const days = parseInt(req.query.days) || 30;

    try {
        console.log('Fetching Analytics for days:', days);
        const pool = await poolPromise;

        // 1. KPIs
        console.log('Fetching KPIs...');
        const kpiQuery = `
            SELECT 
                (SELECT ISNULL(SUM(total_amount), 0) FROM Orders WHERE status = 'completed') as totalRevenue,
                (SELECT COUNT(*) FROM Orders) as totalOrders,
                (SELECT COUNT(*) FROM Users WHERE role_name = 'Customer') as newCustomers,
                (SELECT COUNT(*) FROM (
                    SELECT product_id FROM Stock_Units WHERE status = 1 GROUP BY product_id HAVING COUNT(*) <= 10
                ) as LowStock) as lowStockCount
        `;

        const kpiResult = await pool.request()
            .query(kpiQuery);
        console.log('KPIs fetched');

        // 2. Revenue Chart Data (last X days)
        console.log('Fetching Chart Data...');
        const chartQuery = `
            SELECT 
                SUBSTRING(CONVERT(VARCHAR, created_at, 103), 1, 5) as date,
                ISNULL(SUM(total_amount), 0) as revenue
            FROM Orders
            WHERE status = 'completed' AND created_at >= DATEADD(day, -@days, GETDATE())
            GROUP BY SUBSTRING(CONVERT(VARCHAR, created_at, 103), 1, 5), CAST(created_at AS DATE)
            ORDER BY CAST(created_at AS DATE)
        `;

        const chartResult = await pool.request()
            .input('days', sql.Int, days)
            .query(chartQuery);
        console.log('Chart Data fetched');

        // 3. Low Stock Products List
        console.log('Fetching Low Stock Data...');
        const lowStockQuery = `
            SELECT TOP 5 p.product_id as id, p.product_name as name, p.brand, COUNT(s.serial_number) as stock
            FROM Product p
            LEFT JOIN Stock_Units s ON p.product_id = s.product_id AND s.status = 1
            GROUP BY p.product_id, p.product_name, p.brand
            HAVING COUNT(s.serial_number) <= 10
            ORDER BY stock ASC
        `;
        const lowStockResult = await pool.request().query(lowStockQuery);
        console.log('Low Stock Data fetched');

        res.json({
            kpis: kpiResult.recordset[0],
            revenueData: chartResult.recordset,
            lowStockProducts: lowStockResult.recordset
        });

    } catch (err) {
        console.error('Detailed Analytics error:', err);
        res.status(500).json({ 
            error: 'Lỗi server khi tải báo cáo',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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
router.get('/low-stock', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const lowStockQuery = `
            SELECT p.product_id as id, p.product_name as name, p.brand, COUNT(s.serial_number) as stock
            FROM Product p
            LEFT JOIN Stock_Units s ON p.product_id = s.product_id AND s.status = 1
            GROUP BY p.product_id, p.product_name, p.brand
            HAVING COUNT(s.serial_number) <= 10
            ORDER BY stock ASC
        `;
        const result = await pool.request().query(lowStockQuery);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
