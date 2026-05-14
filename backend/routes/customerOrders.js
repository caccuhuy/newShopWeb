const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');

const generateOrderId = () => `ORD-${Date.now().toString().slice(-9)}`;

/**
 * @swagger
 * tags:
 *   name: Customer Orders
 *   description: Quản lý đơn hàng (Khách hàng)
 */

/**
 * @swagger
 * /api/customer-orders:
 *   post:
 *     summary: Đặt hàng mới
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total_amount
 *               - shipping_address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               total_amount:
 *                 type: number
 *               shipping_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo
 */
// Create a new customer order
router.post('/', verifyToken, isCustomer, async (req, res) => {
    const { items, total_amount, shipping_address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng không được để trống' });
    }
    if (!shipping_address || !total_amount) {
        return res.status(400).json({ message: 'Thông tin giao hàng và tổng tiền là bắt buộc' });
    }

    const orderId = generateOrderId();
    const userId = req.user.id;
    const status = 'pending';

    //biến bảng tạm để insert nhiều dòng vào Order_Details trong một transaction
    const itemTable = new sql.Table('OrderItemType'); 
    itemTable.columns.add('product_id', sql.Int);
    itemTable.columns.add('quantity', sql.Int);
    itemTable.columns.add('unit_price', sql.Decimal(18, 2));
    // Thêm dữ liệu vào bảng tạm
    items.forEach(item => {
        itemTable.rows.add(
            parseInt(item.id || item.product_id), 
            parseInt(item.quantity) || 1,
            parseFloat(item.price || item.unit_price) || 0
        );
    });

    const transaction = new sql.Transaction(await poolPromise);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('orderId', sql.VarChar, orderId)
            .input('userId', sql.VarChar, userId)
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('status', sql.VarChar, status)
            .input('shipping_address', sql.NVarChar, shipping_address)
            .input('items', itemTable);
        await request.execute('sp_AddNewOrder');

        await transaction.commit();
        await logActivity(userId, `Tạo đơn hàng mới ${orderId}`, 'success');

        res.status(201).json({ message: 'Đơn hàng đã được tạo', order_id: orderId });
    } catch (err) {
        console.error('Create customer order error:', err);
        if (transaction && transaction._aborted === false) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }
        }
        res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng' });
    }
});

/**
 * @swagger
 * /api/customer-orders/history:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của tôi
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
// Get customer order history
router.get('/history', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, req.user.id)
            .execute('sp_ViewUserHistory');

        res.json(result.recordset);
    } catch (err) {
        console.error('Customer order history error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy lịch sử đơn hàng' });
    }
});

/**
 * @swagger
 * /api/customer-orders/{id}:
 *   get:
 *     summary: Xem chi tiết đơn hàng của tôi
 *     tags: [Customer Orders]
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
// Get single order detail for customer
router.get('/:id', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const orderResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .input('userId', sql.VarChar, req.user.id)
            .execute('sp_GetOrderDetail');

            if (orderResult.recordsets[0].length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            const order = orderResult.recordsets[0][0]; // Recordset đầu tiên là bảng Orders
            order.items = orderResult.recordsets[1];     // Recordset thứ hai là bảng Order_Details

    } catch (err) {
        console.error('Customer order detail error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy chi tiết đơn hàng' });
    }
});

module.exports = router;
