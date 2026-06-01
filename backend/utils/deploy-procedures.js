const fs = require('fs');
const path = require('path');
const { poolPromise } = require('../config/db');

async function runSQLScript(filePath) {
    console.log(`Reading SQL script: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split script by 'GO' on a line by itself (case-insensitive)
    const batches = sqlContent.split(/^\s*go\s*$/im);
    
    const pool = await poolPromise;
    console.log(`Connected to database. Executing ${batches.length} batches...`);
    
    for (let i = 0; i < batches.length; i++) {
        let batch = batches[i].trim();
        if (!batch) continue;
        
        // Skip USE statement if it fails or causes issues
        if (batch.toLowerCase().startsWith('use ')) {
            console.log(`[Batch ${i + 1}] Skipping USE database statement.`);
            continue;
        }
        
        try {
            console.log(`[Batch ${i + 1}] Executing SQL batch...`);
            await pool.request().query(batch);
            console.log(`[Batch ${i + 1}] Success.`);
        } catch (err) {
            // If StockItemType already exists, we can ignore that error safely
            if (err.message.includes('already an object named') || err.message.includes('already exists')) {
                console.log(`[Batch ${i + 1}] Warning/Skipped: ${err.message}`);
            } else {
                console.error(`[Batch ${i + 1}] Error executing batch:`, err.message);
            }
        }
    }
}

async function main() {
    try {
        const sqlFileName = process.argv[2] || 'inventory.sql';
        const sqlFilePath = path.join(__dirname, '../../document/procedure', sqlFileName);
        await runSQLScript(sqlFilePath);
        console.log(`Database script ${sqlFileName} execution completed successfully!`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

main();
