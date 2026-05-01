const { sql, poolPromise } = require('./config/db');

async function testAnalytics() {
    try {
        const pool = await poolPromise;
        const days = 30;

        console.log('Testing KPIs...');
        const kpiQuery = `
            SELECT 
                (SELECT ISNULL(SUM(total_amount), 0) FROM Orders WHERE status = 'completed') as totalRevenue,
                (SELECT COUNT(*) FROM Orders) as totalOrders,
                (SELECT COUNT(*) FROM Users WHERE role_name = 'Customer') as newCustomers,
                (SELECT COUNT(*) FROM (
                    SELECT product_id FROM Stock_Units WHERE status = 1 GROUP BY product_id HAVING COUNT(*) <= 10
                ) as LowStock) as lowStockCount
        `;
        const kpiResult = await pool.request().query(kpiQuery);
        console.log('KPIs:', kpiResult.recordset[0]);

        console.log('Testing Revenue Chart...');
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
        console.log('Chart Data Count:', chartResult.recordset.length);

        console.log('Testing Low Stock...');
        const lowStockQuery = `
            SELECT TOP 5 p.product_id as id, p.product_name as name, p.brand, COUNT(s.serial_number) as stock
            FROM Product p
            LEFT JOIN Stock_Units s ON p.product_id = s.product_id AND s.status = 1
            GROUP BY p.product_id, p.product_name, p.brand
            HAVING COUNT(s.serial_number) <= 10
            ORDER BY stock ASC
        `;
        const lowStockResult = await pool.request().query(lowStockQuery);
        console.log('Low Stock Count:', lowStockResult.recordset.length);

        console.log('All queries passed!');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testAnalytics();
