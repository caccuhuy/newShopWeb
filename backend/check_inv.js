const { sql, poolPromise } = require('./config/db');

async function check() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Inventory%' OR TABLE_NAME LIKE '%DOC%'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

check();
