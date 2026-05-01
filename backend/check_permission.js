const { sql, poolPromise } = require('./config/db');

async function run() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`DISABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs`);
        console.log('Trigger disabled successfully');
        await pool.request().query(`ENABLE TRIGGER trg_ProtectApprovedHeader ON Inventory_DOCs`);
        console.log('Trigger enabled successfully');
    } catch (err) {
        console.log('Permission status:', err.message);
    } finally {
        sql.close();
    }
}

run();
