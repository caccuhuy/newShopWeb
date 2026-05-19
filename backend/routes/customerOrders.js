const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/customerMiddleware');
const { logActivity } = require('../utils/logger');
const OrderModule = require('../modules/OrderModule');

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
router.post('/', verifyToken, isCustomer, async (req, res, next) => {
    try {
        const { items, total_amount, shipping_address, customer_info } = req.body;
        const result = await OrderModule.createCustomerOrder(req.user.id, items, total_amount, shipping_address, customer_info);
        
        // Log activity asynchronously
        logActivity(req.user.id, `Tạo đơn hàng mới ${result.order_id}`, 'success').catch(console.error);

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
