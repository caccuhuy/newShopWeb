require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function run() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                tr.name AS trigger_name,
                OBJECT_NAME(tr.parent_id) AS table_name,
                sm.definition AS trigger_definition
            FROM sys.triggers tr
            JOIN sys.sql_modules sm ON tr.object_id = sm.object_id
        `);
        console.table(result.recordset.map(r => ({ name: r.trigger_name, table: r.table_name })));
        
        // Log definitions for relevant tables
        const relevantTables = ['Stock_Units', 'Inventory_DOCs', 'DOC_Details', 'Orders'];
        result.recordset.forEach(r => {
            if (relevantTables.includes(r.table_name)) {
                console.log(`\n--- Trigger: ${r.trigger_name} on ${r.table_name} ---`);
                console.log(r.trigger_definition);
            }
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
