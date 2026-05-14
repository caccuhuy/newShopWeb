const sql = require('mssql');
async function test() {
    await sql.connect('mssql://sa:123456@localhost/E_COM');
    try {
        const result1 = await sql.query("EXEC sp_GetOrderAdminDetail @orderId='ORD-PDH61N'");
        console.log('AdminDetail:', result1.recordset);
        
        const result2 = await sql.query("EXEC sp_GetOrderStockReport @orderId='ORD-PDH61N'");
        console.log('StockReport:', result2.recordset);
    } catch(e) {
        console.error('DB Error:', e.message);
    }
    process.exit(0);
}
test();
