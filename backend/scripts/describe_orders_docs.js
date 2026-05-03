require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function describe() {
    try {
        const pool = await poolPromise;
        const tables = ['Orders', 'Order_Details', 'Inventory_DOCs', 'DOC_Details', 'Categories'];
        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            const result = await pool.request()
                .input('tableName', sql.NVarChar, table)
                .query(`
                    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = @tableName
                `);
            console.table(result.recordset);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

describe();
