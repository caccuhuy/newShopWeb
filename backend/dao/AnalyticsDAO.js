const { sql, poolPromise } = require('../config/db');

class AnalyticsDAO {
    static async getKPIs() {
        const pool = await poolPromise;
        const kpiQuery = `
            SELECT 
                (SELECT ISNULL(SUM(total_amount), 0) FROM Orders WHERE status = 'completed') as totalRevenue,
                (SELECT COUNT(*) FROM Orders) as totalOrders,
                (SELECT COUNT(*) FROM Users WHERE role_name = 'Customer') as newCustomers,
                (SELECT COUNT(*) FROM (
                    SELECT product_id FROM Stock_Units WHERE status = 1 GROUP BY product_id HAVING COUNT(*) <= 10
                ) as LowStock) as lowStockCount
        `;
        const result = await pool.request().query(kpiQuery);
        return result.recordset[0];
    }

    static async getRevenueChart(days) {
        const pool = await poolPromise;
        const chartQuery = `
            SELECT 
                SUBSTRING(CONVERT(VARCHAR, created_at, 103), 1, 5) as date,
                ISNULL(SUM(total_amount), 0) as revenue
            FROM Orders
            WHERE status = 'completed' AND created_at >= DATEADD(day, -@days, GETDATE())
            GROUP BY SUBSTRING(CONVERT(VARCHAR, created_at, 103), 1, 5), CAST(created_at AS DATE)
            ORDER BY CAST(created_at AS DATE)
        `;
        const result = await pool.request()
            .input('days', sql.Int, days)
            .query(chartQuery);
        return result.recordset;
    }

    static async getTopLowStock() {
        const pool = await poolPromise;
        const lowStockQuery = `
            SELECT TOP 5 p.product_id as id, p.product_name as name, p.brand, COUNT(s.serial_number) as stock
            FROM Product p
            LEFT JOIN Stock_Units s ON p.product_id = s.product_id AND s.status = 1
            GROUP BY p.product_id, p.product_name, p.brand
            HAVING COUNT(s.serial_number) <= 10
            ORDER BY stock ASC
        `;
        const result = await pool.request().query(lowStockQuery);
        return result.recordset;
    }

    static async getAllLowStock() {
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
        return result.recordset;
    }
}

module.exports = AnalyticsDAO;
