require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function run() {
    try {
        const pool = await poolPromise;
        console.log('--- Distinct Order Statuses ---');
        const statusResult = await pool.request().query("SELECT DISTINCT status FROM Orders");
        console.table(statusResult.recordset);

        console.log('\n--- Orders with status like "chờ" ---');
        const likeResult = await pool.request().query("SELECT TOP 10 * FROM Orders WHERE status LIKE N'%chờ%'");
        console.table(likeResult.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
