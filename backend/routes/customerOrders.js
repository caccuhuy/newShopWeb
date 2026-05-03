const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');

const generateOrderId = () => `ORD-${Date.now().toString().slice(-9)}`;

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

    const transaction = new sql.Transaction(await poolPromise);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('orderId', sql.VarChar, orderId)
            .input('userId', sql.VarChar, userId)
            .input('totalAmount', sql.Decimal(18, 2), total_amount)
            .input('status', sql.VarChar, status)
            .input('shippingAddress', sql.NVarChar, shipping_address)
            .query(`
                INSERT INTO Orders (order_id, user_id, total_amount, status, shipping_address, created_at)
                VALUES (@orderId, @userId, @totalAmount, @status, @shippingAddress, GETDATE())
            `);

        for (const item of items) {
            const quantity = Number(item.quantity) || 1;
            const unitPrice = Number(item.price || item.unit_price || 0);

            await new sql.Request(transaction)
                .input('orderId', sql.VarChar, orderId)
                .input('productId', sql.Int, item.id)
                .input('quantity', sql.Int, quantity)
                .input('unitPrice', sql.Decimal(18, 2), unitPrice)
                .query(`
                    INSERT INTO Order_Details (order_id, product_id, quantity, unit_price)
                    VALUES (@orderId, @productId, @quantity, @unitPrice)
                `);
        }

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

// Get customer order history
router.get('/history', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, req.user.id)
            .query(`
                SELECT o.order_id, o.total_amount, o.status, o.shipping_address, o.created_at,
                       (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) as item_count
                FROM Orders o
                WHERE o.user_id = @userId
                ORDER BY o.created_at DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Customer order history error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy lịch sử đơn hàng' });
    }
});

// Get single order detail for customer
router.get('/:id', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const orderResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .input('userId', sql.VarChar, req.user.id)
            .query(`
                SELECT * FROM Orders
                WHERE order_id = @orderId AND user_id = @userId
            `);

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        const detailResult = await pool.request()
            .input('orderId', sql.VarChar, req.params.id)
            .query(`
                SELECT od.product_id, od.quantity, od.unit_price, p.product_name, p.image_url
                FROM Order_Details od
                LEFT JOIN Product p ON od.product_id = p.product_id
                WHERE od.order_id = @orderId
            `);

        const order = orderResult.recordset[0];
        res.json({
            order_id: order.order_id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            items: detailResult.recordset
        });
    } catch (err) {
        console.error('Customer order detail error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy chi tiết đơn hàng' });
    }
});

module.exports = router;
