require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function listAdmins() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT email, role_name FROM Users WHERE role_name = 'Admin'");
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAdmins();
