const { sql, poolPromise } = require('./config/db');

async function list() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES`);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

list();
