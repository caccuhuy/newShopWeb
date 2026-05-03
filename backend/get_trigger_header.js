const { sql, poolPromise } = require('./config/db');

async function getTrigger() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT definition 
            FROM sys.sql_modules 
            WHERE object_id = OBJECT_ID('trg_ProtectApprovedHeader')
        `);
        console.log(result.recordset[0]?.definition);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

getTrigger();
