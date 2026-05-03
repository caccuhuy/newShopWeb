require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function fixMockSerials() {
    try {
        const pool = await poolPromise;
        console.log('Fetching completed orders...');
        
        const ordersResult = await pool.request().query(`
            SELECT order_id FROM Orders WHERE status = 'completed'
        `);
        
        for (const order of ordersResult.recordset) {
            const orderId = order.order_id;
            
            // Check if it already has serials
            const existingDetails = await pool.request()
                .input('oid', sql.VarChar, orderId)
                .query(`
                    SELECT COUNT(*) as count 
                    FROM DOC_Details dd 
                    JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                    WHERE idoc.order_ref = @oid
                `);
            
            if (existingDetails.recordset[0].count > 0) {
                console.log(`Order ${orderId} already has serials. Skipping.`);
                continue;
            }

            console.log(`Fixing serials for order ${orderId}...`);
            const docId = `XM-${Math.random().toString(36).substring(7).toUpperCase()}`.slice(0, 10);
            
            // Create Doc as DRAFT (0)
            await pool.request()
                .input('doc_id', sql.Char(10), docId)
                .input('doc_type', sql.TinyInt, 2)
                .input('created_by', sql.VarChar, '0001')
                .input('desc', sql.NVarChar, `Mock export for completed order ${orderId}`)
                .input('status', sql.TinyInt, 0) // Draft
                .input('inv_id', sql.TinyInt, 1)
                .input('order_ref', sql.VarChar, orderId)
                .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, Doc_description, status, inventory_id, order_ref) 
                        VALUES (@doc_id, @doc_type, @created_by, @desc, @status, @inv_id, @order_ref)`);
            
            // Get order items
            const itemsResult = await pool.request()
                .input('oid', sql.VarChar, orderId)
                .query("SELECT product_id, quantity, unit_price FROM Order_Details WHERE order_id = @oid");
            
            const usedSerials = [];
            for (const item of itemsResult.recordset) {
                console.log(`Adding ${item.quantity} serials for product ${item.product_id}...`);
                
                // Find available serials
                const serialsResult = await pool.request()
                    .input('pid', sql.Int, item.product_id)
                    .query(`SELECT TOP ${item.quantity} serial_number FROM Stock_Units WHERE product_id = @pid AND status = 1`);
                
                const serials = serialsResult.recordset.map(s => s.serial_number);
                while (serials.length < item.quantity) {
                    serials.push(`SN-M-${Math.random().toString(36).substring(7).toUpperCase()}`);
                }
                
                for (const sn of serials) {
                    // MUST BE STATUS 1 FOR TRIGGER TO APPROVE
                    const snExist = await pool.request()
                        .input('sn', sql.VarChar, sn)
                        .query("SELECT COUNT(*) as count FROM Stock_Units WHERE serial_number = @sn");
                    
                    if (snExist.recordset[0].count === 0) {
                        await pool.request()
                            .input('sn', sql.VarChar, sn)
                            .input('pid', sql.Int, item.product_id)
                            .query("INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, 1)");
                    } else {
                        await pool.request()
                            .input('sn', sql.VarChar, sn)
                            .query("UPDATE Stock_Units SET status = 1 WHERE serial_number = @sn");
                    }
                    
                    // Insert into DOC_Details
                    await pool.request()
                        .input('did', sql.Char(10), docId)
                        .input('sn', sql.VarChar, sn)
                        .input('pid', sql.Int, item.product_id)
                        .input('price', sql.Decimal(18, 2), item.unit_price)
                        .query("INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price) VALUES (@did, @sn, @pid, @price)");
                    
                    usedSerials.push(sn);
                }
            }

            // Promote to APPROVED (1)
            console.log(`Promoting document ${docId} to approved...`);
            await pool.request()
                .input('did', sql.Char(10), docId)
                .query("UPDATE Inventory_DOCs SET status = 1 WHERE doc_id = @did");
            
            // Now update serials to status 3 (Completed)
            console.log(`Setting serials to status 3 (Completed)...`);
            for (const sn of usedSerials) {
                await pool.request()
                    .input('sn', sql.VarChar, sn)
                    .query("UPDATE Stock_Units SET status = 3 WHERE serial_number = @sn");
            }
        }
        
        console.log('Mock serials fixed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing mock serials:', err);
        process.exit(1);
    }
}

fixMockSerials();
