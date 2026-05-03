require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        console.log('Renaming waraty_period to warranty_period...');
        
        // Use sp_rename to rename the column
        await pool.request().query("EXEC sp_rename 'Product.waraty_period', 'warranty_period', 'COLUMN'");
        
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
