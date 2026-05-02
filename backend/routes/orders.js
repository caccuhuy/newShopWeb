const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');

// Get all orders (Staff/Admin)
router.get('/', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT o.*, u.username as customer_name, u.phone_number as customer_phone,
                   (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
            FROM Orders o
            LEFT JOIN Users u ON o.user_id = u.user_id
            ORDER BY o.created_at DESC
        `);
        
        // Map data to match frontend expectations if necessary
        const orders = result.recordset.map(order => ({
            id: order.order_id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            customer_info: {
                name: order.customer_name || 'Khách vãng lai',
                phone: order.customer_phone || 'N/A'
            },
            item_count: order.item_count
        }));
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get order details
router.get('/:id', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const orderResult = await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .query("SELECT o.*, u.username, u.phone_number FROM Orders o LEFT JOIN Users u ON o.user_id = u.user_id WHERE o.order_id = @id");
            
        if (orderResult.recordset.length === 0) return res.status(404).json({ message: 'Order not found' });

        const detailsResult = await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .query(`
                SELECT od.*, p.product_name, p.image_url,
                       (SELECT STRING_AGG(dd.serial_number, ', ') 
                        FROM DOC_Details dd 
                        JOIN Inventory_DOCs idoc ON dd.doc_id = idoc.doc_id 
                        WHERE idoc.order_ref = od.order_id AND dd.product_id = od.product_id) as serials
                FROM Order_Details od 
                JOIN Product p ON od.product_id = p.product_id 
                WHERE od.order_id = @id
            `);

        const order = orderResult.recordset[0];
        res.json({
            ...order,
            id: order.order_id,
            customer_info: {
                name: order.username || 'Khách vãng lai',
                phone: order.phone_number || 'N/A'
            },
            items: detailsResult.recordset.map(item => ({
                ...item,
                price_at_time: item.unit_price, // Map unit_price to price_at_time for frontend compatibility
                serials: item.serials ? item.serials.split(', ') : []
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check stock and get available serials for an order
router.get('/:id/check-stock', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const itemsResult = await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .query("SELECT product_id, quantity FROM Order_Details WHERE order_id = @id");

        const stockReport = [];
        for (const item of itemsResult.recordset) {
            const serialsResult = await pool.request()
                .input('pid', sql.Int, item.product_id)
                .query("SELECT serial_number FROM Stock_Units WHERE product_id = @pid AND status = 1");
            
            stockReport.push({
                product_id: item.product_id,
                required: item.quantity,
                available: serialsResult.recordset.length,
                available_serials: serialsResult.recordset.map(s => s.serial_number)
            });
        }
        
        res.json(stockReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Process Order Export (Create DOC and update stock)
router.post('/:id/export', verifyToken, isStaff, async (req, res) => {
    const orderId = req.params.id;
    const { serials } = req.body; // Array of objects: { product_id, serial_number, unit_price }
    const staffId = req.user.id;
    
    // Debug logging
    console.log(`Starting export for Order: ${orderId}, User: ${staffId}, Serials: ${serials.length}`);

    const transaction = new sql.Transaction(await poolPromise);
    try {
        await transaction.begin();
        
        const docId = `EX-${Date.now().toString().slice(-7)}`;
        
        // 1. Create Inventory_DOC (Type 2 = Export) as DRAFT (status 0)
        const docRequest = new sql.Request(transaction);
        await docRequest
            .input('doc_id', sql.Char(10), docId)
            .input('doc_type', sql.TinyInt, 2)
            .input('created_by', sql.VarChar, staffId)
            .input('desc', sql.NVarChar, `Phiếu xuất chờ duyệt cho đơn hàng #${orderId}`)
            .input('status', sql.TinyInt, 0) // Start as Draft
            .input('order_ref', sql.VarChar, orderId)
            .input('inv_id', sql.TinyInt, 1)
            .query(`INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, created_at, Doc_description, status, order_ref, inventory_id)
                    VALUES (@doc_id, @doc_type, @created_by, GETDATE(), @desc, @status, @order_ref, @inv_id)`);

        for (const item of serials) {
            // 2. Create DOC_Details
            const detailRequest = new sql.Request(transaction);
            await detailRequest
                .input('doc_id', sql.Char(10), docId)
                .input('sn', sql.VarChar, item.serial_number)
                .input('pid', sql.Int, item.product_id)
                .input('price', sql.Decimal(18, 2), item.unit_price)
                .query(`INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                        VALUES (@doc_id, @sn, @pid, @price)`);
            
            // Note: We don't update Stock_Units manually here. 
            // The trigger trg_HandleInventoryApproval will do it when we set status to 1.
        }

        // 3. (REMOVED) We no longer auto-approve the document here. 
        // Approval will be handled in the Inventory Management module.

        // 4. Update Order Status to 'processing' (Waiting for export approval)
        const orderRequest = new sql.Request(transaction);
        await orderRequest
            .input('id', sql.VarChar, orderId)
            .query("UPDATE Orders SET status = 'processing' WHERE order_id = @id");

        await transaction.commit();
        res.json({ message: 'Đã xác nhận đơn hàng và tạo phiếu xuất kho nháp', docId });
    } catch (err) {
        console.error('Export Error:', err);
        if (transaction && transaction.active) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Rollback failed:', rollbackErr);
            }
        }
        res.status(500).json({ 
            error: err.message,
            details: err.number || err.code
        });
    }
});

// Simple status update (e.g. for cancelling)
router.put('/:id/status', verifyToken, isStaff, async (req, res) => {
    const { status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .input('status', sql.VarChar, status)
            .query("UPDATE Orders SET status = @status WHERE order_id = @id");
        res.json({ message: 'Trạng thái đơn hàng đã được cập nhật' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
