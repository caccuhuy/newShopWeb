const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng (Nhân viên)
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
// Get all orders (Staff/Admin)
router.get('/', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_AllOrders');
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

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Lấy danh sách lịch sử mua hàng của khách hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng cá nhân
 *       500:
 *         description: Lỗi máy chủ
 */
// Get all orders for the logged in customer
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, req.user.id)
            .execute('sp_GetCustomerOrders');
        
        const orders = result.recordset.map(order => ({
            id: order.order_id,
            total_amount: order.total_amount,
            status: order.status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            item_count: order.item_count
        }));
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/orders/my-orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng của khách hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng cá nhân
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi máy chủ
 */
// Get order details for a customer
router.get('/my-orders/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const orderResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .execute('sp_GetOrderAdminDetail');
            
        if (!orderResult.recordset || orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const jsonString = Object.values(orderResult.recordset[0])[0];
        if (!jsonString) return res.status(404).json({ message: 'Order not found' });
        
        const orderData = JSON.parse(jsonString);

        if (orderData.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Parse serials
        if (orderData.items) {
            orderData.items.forEach(item => {
                if (typeof item.serials_raw === 'string') {
                    item.serials = JSON.parse('[' + item.serials_raw + ']');
                } else {
                    item.serials = [];
                }
                delete item.serials_raw;
            });
        }

        res.json(orderData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 */
// Get order details
router.get('/:id', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const orderResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .execute('sp_GetOrderAdminDetail');
            
        if (!orderResult.recordset || orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Parse chuỗi JSON duy nhất trả về từ SQL an toàn
        const jsonString = Object.values(orderResult.recordset[0])[0];
        if (!jsonString) return res.status(404).json({ message: 'Order not found' });
        
        const orderData = JSON.parse(jsonString);

        // Hậu xử lý nhẹ cho mảng serials nếu SQL trả về dạng chuỗi
        if (orderData.items) {
            orderData.items.forEach(item => {
                if (typeof item.serials_raw === 'string') {
                    item.serials = JSON.parse('[' + item.serials_raw + ']');
                } else {
                    item.serials = [];
                }
                delete item.serials_raw;
            });
        }

        res.json(orderData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/orders/{id}/check-stock:
 *   get:
 *     summary: Kiểm tra tồn kho và lấy số serial khả dụng cho đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Báo cáo tồn kho
 */
// Check stock and get available serials for an order
router.get('/:id/check-stock', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const itemsResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .execute('sp_GetOrderStockReport');

        if (!itemsResult.recordset || itemsResult.recordset.length === 0) {
            return res.json([]);
        }

        // SQL Server trả về chuỗi JSON an toàn
        const jsonString = Object.values(itemsResult.recordset[0])[0];
        if (!jsonString) return res.json([]);

        let stockReport = JSON.parse(jsonString);

        // Chuyển đổi định dạng mảng serials từ [{serial_number: "SN1"}] thành ["SN1"] 
        stockReport = stockReport.map(item => ({
            ...item,
            available_serials: item.available_serials_raw 
                ? item.available_serials_raw.map(s => s.serial_number) 
                : []
        }));
        res.json(stockReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/orders/{id}/export:
 *   post:
 *     summary: Xử lý xuất kho cho đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     serial_number:
 *                       type: string
 *                     unit_price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Đã tạo phiếu xuất kho nháp
 */
// Process Order Export (Create DOC and update stock)
router.post('/:id/export', verifyToken, isStaff, async (req, res) => {
    const orderId = req.params.id;
    const { serials } = req.body; // Array of objects: { product_id, serial_number, unit_price }
    const staffId = req.user.id;
    
    // Debug logging
    console.log(`Starting export for Order: ${orderId}, User: ${staffId}, Serials: ${serials.length}`);

    const transaction = new sql.Transaction(await poolPromise);

    const detailTable = new sql.Table('StockItemType');
        detailTable.columns.add('product_id', sql.Int);
        detailTable.columns.add('serial_number', sql.VarChar(50));
        detailTable.columns.add('unit_price', sql.Decimal(18, 2));

        serials.forEach(item => {
            detailTable.rows.add(item.product_id, item.serial_number, item.unit_price);
        });

    try {
        await transaction.begin();
        
        const docId = `EX-${Date.now().toString().slice(-7)}`;
        
        // 1. Create Inventory_DOC (Type 2 = Export) as DRAFT (status 0)
        const docRequest = new sql.Request(transaction);
        await docRequest.input('doc_id', sql.Char(10), docId)
            .input('staffId', sql.VarChar, staffId)
            .input('orderId', sql.VarChar, orderId)
            .input('details', detailTable)
            .execute('sp_ConfirmOrderAndCreateExport');

        await transaction.commit();
        await logActivity(staffId, `Xác nhận đơn hàng #${orderId} và tạo phiếu xuất kho: ${docId}`, 'success');
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

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, completed, cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Simple status update (e.g. for cancelling)
router.put('/:id/status', verifyToken, isStaff, async (req, res) => {
    const { status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .input('status', sql.VarChar, status)
            .execute('sp_ChangeOrderStatus');
        
        const statusMap = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đang giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        const statusStr = statusMap[status] || status;
        const logType = status === 'cancelled' ? 'danger' : 'info';
        await logActivity(req.user.id, `Cập nhật đơn hàng #${req.params.id} sang trạng thái: ${statusStr}`, logType);

        res.json({ message: 'Trạng thái đơn hàng đã được cập nhật' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
