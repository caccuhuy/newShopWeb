const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get Dashboard Stats
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
    const days = parseInt(req.query.days) || 30;

    try {
        const pool = await poolPromise;

        // 1. KPIs
        // Note: Users table doesn't have created_at, so we return total customers for now.
        // Product table doesn't have stock_quantity, we calculate from Stock_Units.
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
            .input('days', sql.Int, days)
            .query(kpiQuery);

        // 2. Revenue Chart Data (last X days)
        const chartQuery = `
            SELECT 
                FORMAT(created_at, 'dd/MM') as date,
                ISNULL(SUM(total_amount), 0) as revenue
            FROM Orders
            WHERE status = 'completed' AND created_at >= DATEADD(day, -@days, GETDATE())
            GROUP BY FORMAT(created_at, 'dd/MM'), CAST(created_at AS DATE)
            ORDER BY CAST(created_at AS DATE)
        `;

        const chartResult = await pool.request()
            .input('days', sql.Int, days)
            .query(chartQuery);

        // 3. Low Stock Products List (calculate from Stock_Units)
        const lowStockQuery = `
            SELECT TOP 5 p.product_id as id, p.product_name as name, p.brand, COUNT(s.serial_number) as stock
            FROM Product p
            LEFT JOIN Stock_Units s ON p.product_id = s.product_id AND s.status = 1
            GROUP BY p.product_id, p.product_name, p.brand
            HAVING COUNT(s.serial_number) <= 10
            ORDER BY stock ASC
        `;
        const lowStockResult = await pool.request().query(lowStockQuery);

        res.json({
            kpis: kpiResult.recordset[0],
            revenueData: chartResult.recordset,
            lowStockProducts: lowStockResult.recordset
        });

    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Lỗi server khi tải báo cáo: ' + err.message });
    }
});

module.exports = router;
