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
        const result = await sql.query(`
        ALTER PROCEDURE sp_GetInventoryDocDetail
            @docId CHAR(10)
        AS
        BEGIN
            SET NOCOUNT ON;
            SELECT idoc.*, s.supplier_name,
                (
                    SELECT dd.*, p.product_name, p.brand
                    FROM DOC_Details dd
                    JOIN Product p ON dd.product_id = p.product_id
                    WHERE dd.doc_id = idoc.doc_id
                    FOR JSON PATH
                ) AS details
            FROM Inventory_DOCs idoc
            LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
            WHERE idoc.doc_id = @docId
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        END
        `);
        console.log("Altered SP successfully.");
        
        const testRun = await sql.query(`EXEC sp_GetInventoryDocDetail @docId='EX-6779957'`);
        console.dir(testRun.recordset, { depth: null });
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

test();
