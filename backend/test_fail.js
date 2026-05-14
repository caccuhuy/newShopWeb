const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'E_COM',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function test() {
    try {
        await sql.connect(config);
        const result = await sql.query(`EXEC sp_GetInventoryDocDetail @docId='EX-7652543'`);
        console.log("Recordset:");
        console.dir(result.recordset, { depth: null });
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

test();
