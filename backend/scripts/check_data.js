require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function run() {
    try {
        const pool = await poolPromise;
        console.log('--- Stock Units Status Count ---');
        const counts = await pool.request().query("SELECT status, COUNT(*) as count FROM Stock_Units GROUP BY status");
        console.table(counts.recordset);
        
        console.log('\n--- Stock Units (Sample) ---');
        const stock = await pool.request().query("SELECT TOP 20 * FROM Stock_Units");
        console.table(stock.recordset);

        console.log('\n--- Inventory Docs ---');
        const docs = await pool.request().query("SELECT TOP 10 * FROM Inventory_DOCs ORDER BY created_at DESC");
        console.table(docs.recordset);

        console.log('\n--- Doc Details for last doc ---');
        if (docs.recordset.length > 0) {
            const lastDocId = docs.recordset[0].doc_id;
            const details = await pool.request()
                .input('id', sql.Char(10), lastDocId)
                .query("SELECT * FROM DOC_Details WHERE doc_id = @id");
            console.table(details.recordset);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
