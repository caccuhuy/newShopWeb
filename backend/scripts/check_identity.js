require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function run() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                t.name as table_name,
                c.name as column_name,
                c.is_identity
            FROM sys.columns c
            JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name IN ('Inventory_DOCs', 'DOC_Details')
        `);
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
