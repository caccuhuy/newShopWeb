const { sql, poolPromise } = require('./config/db');

async function run() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT Suppliers_tax_id FROM Suppliers`);
        console.log(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

run();
