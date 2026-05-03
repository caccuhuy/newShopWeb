require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function fixMissingSerials() {
    try {
        const pool = await poolPromise;
        console.log('Fetching completed orders with serial discrepancy...');
        
        const discrepancyQuery = `
            SELECT od.order_id, od.product_id, od.quantity, od.unit_price
            FROM Order_Details od
            JOIN Orders o ON od.order_id = o.order_id
            WHERE o.status = 'completed'
              AND od.quantity > (
                SELECT COUNT(*) 
                FROM DOC_Details dd 
                JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id
              )
        `;
        const discrepancyResult = await pool.request().query(discrepancyQuery);
        
        console.log(`Found ${discrepancyResult.recordset.length} mismatched product items.`);
        
        // Group by order_id
        const orderGroups = {};
        for (const item of discrepancyResult.recordset) {
            if (!orderGroups[item.order_id]) orderGroups[item.order_id] = [];
            orderGroups[item.order_id].push(item);
        }

        for (const orderId in orderGroups) {
            console.log(`Processing order ${orderId}...`);
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            
            try {
                const docId = `XS-${Math.random().toString(36).substring(7).toUpperCase()}`.slice(0, 10);
                
                // Create Doc as DRAFT (0)
                await transaction.request()
                    .input('doc_id', sql.Char(10), docId)
                    .input('doc_type', sql.TinyInt, 2)
                    .input('created_by', sql.VarChar, '0001')
                    .input('desc', sql.NVarChar, `Supplementary fix for order ${orderId}`)
                    .input('status', sql.TinyInt, 0)
                    .input('inv_id', sql.TinyInt, 1)
                    .input('order_ref', sql.VarChar, orderId)
                    .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, Doc_description, status, inventory_id, order_ref) 
                            VALUES (@doc_id, @doc_type, @created_by, @desc, @status, @inv_id, @order_ref)`);

                const allSerials = [];
                for (const item of orderGroups[orderId]) {
                    const { product_id, quantity, unit_price } = item;
                    
                    const currentCountResult = await transaction.request()
                        .input('oid', sql.VarChar, orderId)
                        .input('pid', sql.Int, product_id)
                        .query(`
                            SELECT COUNT(*) as count 
                            FROM DOC_Details dd 
                            JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                            WHERE idoc.order_ref = @oid AND dd.product_id = @pid
                        `);
                    const needed = quantity - currentCountResult.recordset[0].count;
                    
                    if (needed <= 0) continue;

                    // Find or create serials
                    const serialsResult = await transaction.request()
                        .input('pid', sql.Int, product_id)
                        .query(`SELECT TOP ${needed} serial_number FROM Stock_Units WHERE product_id = @pid AND status = 1`);
                    
                    const serials = serialsResult.recordset.map(s => s.serial_number);
                    while (serials.length < needed) {
                        serials.push(`SN-F-${Math.random().toString(36).substring(7).toUpperCase()}`.slice(0, 20));
                    }

                    for (const sn of serials) {
                        // Ensure SN status 1
                        await transaction.request()
                            .input('sn', sql.VarChar, sn)
                            .input('pid', sql.Int, product_id)
                            .query(`
                                IF EXISTS (SELECT 1 FROM Stock_Units WHERE serial_number = @sn)
                                    UPDATE Stock_Units SET status = 1 WHERE serial_number = @sn
                                ELSE
                                    INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, 1)
                            `);
                        
                        // Add detail
                        await transaction.request()
                            .input('did', sql.Char(10), docId)
                            .input('sn', sql.VarChar, sn)
                            .input('pid', sql.Int, product_id)
                            .input('price', sql.Decimal(18, 2), unit_price)
                            .query("INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price) VALUES (@did, @sn, @pid, @price)");
                        
                        allSerials.push(sn);
                    }
                }

                // Approve doc (this will fire triggers)
                await transaction.request()
                    .input('did', sql.Char(10), docId)
                    .query("UPDATE Inventory_DOCs SET status = 1 WHERE doc_id = @did");
                
                // Final status 3 for serials
                for (const sn of allSerials) {
                    await transaction.request()
                        .input('sn', sql.VarChar, sn)
                        .query("UPDATE Stock_Units SET status = 3 WHERE serial_number = @sn");
                }

                await transaction.commit();
                console.log(`Order ${orderId} fixed successfully.`);
            } catch (err) {
                await transaction.rollback();
                console.error(`Error fixing order ${orderId}:`, err.message);
            }
        }
        
        console.log('Batch fix completed!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixMissingSerials();
