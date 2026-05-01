const { sql, poolPromise } = require('./config/db');

async function describe() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Suppliers'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

describe();
