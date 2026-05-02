require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function checkStockTriggers() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT name FROM sys.triggers WHERE parent_id = OBJECT_ID('Stock_Units')");
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkStockTriggers();
