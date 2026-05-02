require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function debugDiscrepancy() {
    try {
        const pool = await poolPromise;
        
        console.log('--- Orders with Serial Discrepancy ---');
        const query = `
            SELECT od.order_id, od.product_id, od.quantity, 
                   (SELECT COUNT(*) 
                    FROM DOC_Details dd 
                    JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                    WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id) as serial_count,
                   o.total_amount
            FROM Order_Details od
            JOIN Orders o ON od.order_id = o.order_id
            WHERE o.status = 'completed'
              AND od.quantity != (
                SELECT COUNT(*) 
                FROM DOC_Details dd 
                JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id
              )
        `;
        const result = await pool.request().query(query);
        console.table(result.recordset);
        
        if (result.recordset.length > 0) {
            const first = result.recordset[0];
            console.log(`\nDebugging order ${first.order_id}...`);
            const docs = await pool.request()
                .input('oid', sql.VarChar, first.order_id)
                .query("SELECT doc_id, status FROM Inventory_DOCs WHERE order_ref = @oid");
            console.log('Related Documents:', docs.recordset);
        }

        console.log('\n--- Order Status Distribution ---');
        const statusResult = await pool.request().query("SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM Orders GROUP BY status");
        console.table(statusResult.recordset);
        
        console.log('\n--- KPI Check ---');
        const kpiCheck = await pool.request().query("SELECT SUM(total_amount) as totalRevenue FROM Orders WHERE status = 'completed'");
        console.log('Total Revenue (Completed):', kpiCheck.recordset[0].totalRevenue);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugDiscrepancy();
