require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function test() {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const docId = `EX-${Date.now().toString().slice(-7)}`;
        console.log('Using docId:', docId);

        // 1. Header
        await new sql.Request(transaction)
            .input('doc_id', sql.Char(10), docId)
            .input('doc_type', sql.TinyInt, 2)
            .input('created_by', sql.VarChar, 'admin')
            .input('desc', sql.NVarChar, 'Test Export')
            .input('status', sql.TinyInt, 0)
            .input('inv_id', sql.TinyInt, 1)
            .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, created_at, Doc_description, status, inventory_id)
                    VALUES (@doc_id, @doc_type, @created_by, GETDATE(), @desc, @status, @inv_id)`);

        // 2. Find a status 1 serial
        const stock = await pool.request().query("SELECT TOP 1 serial_number, product_id, unit_price FROM Stock_Units s JOIN Product p ON s.product_id = p.product_id WHERE s.status = 1");
        if (stock.recordset.length === 0) throw new Error('No status 1 stock found');
        const item = stock.recordset[0];
        console.log('Using serial:', item.serial_number);

        // 3. Detail
        await new sql.Request(transaction)
            .input('doc_id', sql.Char(10), docId)
            .input('sn', sql.VarChar, item.serial_number)
            .input('pid', sql.Int, item.product_id)
            .input('price', sql.Decimal(18, 2), item.unit_price)
            .query(`INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                    VALUES (@doc_id, @sn, @pid, @price)`);

        // 4. Approve
        console.log('Approving...');
        await new sql.Request(transaction)
            .input('doc_id', sql.Char(10), docId)
            .query("UPDATE Inventory_DOCs SET status = 1 WHERE doc_id = @doc_id");

        await transaction.commit();
        console.log('Success!');
    } catch (err) {
        console.error('FAILED:', err.message);
        if (transaction.active) await transaction.rollback();
    }
    process.exit(0);
}
test();
