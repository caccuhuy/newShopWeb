const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create Order
router.post('/', async (req, res) => {
    const { user_id, total_amount, shipping_address, items } = req.body;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
            [user_id || null, total_amount, shipping_address]
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();
        res.json({ message: 'Đặt hàng thành công!', orderId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
