const { sql, poolPromise } = require('./config/db');

async function checkRows() {
    try {
        const pool = await poolPromise;
        const tables = ['Users', 'Product', 'Orders', 'Order_Details', 'Inventory_DOCs', 'Inventory_DOC_Details'];
        for (const table of tables) {
            try {
                const result = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`${table}: ${result.recordset[0].count} rows`);
            } catch (err) {
                console.log(`${table}: Error or doesn't exist`);
            }
        }
    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        sql.close();
    }
}

checkRows();
