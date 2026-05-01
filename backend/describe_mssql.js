const { sql, poolPromise } = require('./config/db');

async function describe() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('Orders', 'Order_Details', 'Inventory_DOCs', 'DOC_Details', 'Inventory_address')
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

describe();
