require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function getTriggerDefinition() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT sm.definition
            FROM sys.sql_modules AS sm
            JOIN sys.objects AS o ON sm.object_id = o.object_id
            WHERE o.name = 'trg_HandleInventoryApproval'
        `);
        
        if (result.recordset.length > 0) {
            console.log('--- TRIGGER DEFINITION ---');
            console.log(result.recordset[0].definition);
            console.log('---------------------------');
        } else {
            console.log('Trigger trg_HandleInventoryApproval not found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getTriggerDefinition();
