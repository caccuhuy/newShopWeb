const { sql, poolPromise } = require('./config/db');

async function describe() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

describe();
