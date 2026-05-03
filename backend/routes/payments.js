const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');

const getPaymentGatewayUrl = () => process.env.PAYMENT_GATEWAY_URL || 'https://fakepay.example.com';

router.post('/create', verifyToken, isCustomer, async (req, res) => {
    const { order_id, payment_method } = req.body;
    if (!order_id || !payment_method) {
        return res.status(400).json({ message: 'order_id và payment_method là bắt buộc' });
    }

    const paymentUrl = `${getPaymentGatewayUrl()}/pay?order_id=${encodeURIComponent(order_id)}&method=${encodeURIComponent(payment_method)}`;

    res.json({
        order_id,
        payment_method,
        payment_url: paymentUrl,
        status: 'pending'
    });
});

router.post('/confirm', verifyToken, isCustomer, async (req, res) => {
    const { order_id, payment_status, transaction_id } = req.body;
    if (!order_id || !payment_status) {
        return res.status(400).json({ message: 'order_id và payment_status là bắt buộc' });
    }

    try {
        const pool = await poolPromise;
        const validOrder = await pool.request()
            .input('orderId', sql.VarChar, order_id)
            .input('userId', sql.VarChar, req.user.id)
            .query('SELECT * FROM Orders WHERE order_id = @orderId AND user_id = @userId');

        if (validOrder.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xác nhận thanh toán' });
        }

        const newStatus = payment_status === 'success' ? 'paid' : 'pending';
        await pool.request()
            .input('orderId', sql.VarChar, order_id)
            .input('status', sql.VarChar, newStatus)
            .query('UPDATE Orders SET status = @status WHERE order_id = @orderId');

        await logActivity(req.user.id, `Xác nhận thanh toán đơn hàng ${order_id}: ${payment_status}`, payment_status === 'success' ? 'success' : 'warning');

        res.json({ order_id, status: newStatus, transaction_id: transaction_id || null });
    } catch (err) {
        console.error('Payment confirm error:', err);
        res.status(500).json({ error: 'Lỗi server khi xác nhận thanh toán' });
    }
});

router.get('/status/:orderId', verifyToken, isCustomer, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('orderId', sql.VarChar, req.params.orderId)
            .input('userId', sql.VarChar, req.user.id)
            .query('SELECT status FROM Orders WHERE order_id = @orderId AND user_id = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.json({ order_id: req.params.orderId, status: result.recordset[0].status });
    } catch (err) {
        console.error('Payment status error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy trạng thái thanh toán' });
    }
});

module.exports = router;
