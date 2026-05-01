const { sql, poolPromise } = require('./config/db');

async function checkPK() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'Order_Details'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

checkPK();
