const express = require('express');
const router = express.Router();
const { verifyToken, isStaff } = require('../middleware/authMiddleware');
const OrderModule = require('../modules/OrderModule');

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
router.get('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const orders = await OrderModule.getAllOrders();
        res.json(orders);
    } catch (err) {
        next(err);
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
router.get('/my-orders', verifyToken, async (req, res, next) => {
    try {
        const orders = await OrderModule.getCustomerOrders(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
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
 *         description: Chi tiết đơn hàng cá nhân an toàn
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi máy chủ
 */
// Get single order detail securely for logged-in customer
router.get('/my-orders/:id', verifyToken, async (req, res, next) => {
    try {
        const orderDetail = await OrderModule.getCustomerOrderDetail(req.params.id, req.user.id);
        res.json(orderDetail);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Chi tiết đơn hàng
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
// Get single order detail
router.get('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const orderDetail = await OrderModule.getOrderDetailForStaff(req.params.id);
        res.json(orderDetail);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/orders/{id}/check-stock:
 *   get:
 *     summary: Lấy Serial khả dụng
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
 *         description: Danh sách tồn kho khả dụng
 */
// Check stock availability and get valid serials for order items
router.get('/:id/check-stock', verifyToken, isStaff, async (req, res, next) => {
    try {
        const availableSerials = await OrderModule.checkStock(req.params.id);
        res.json(availableSerials);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/orders/{id}/export:
 *   post:
 *     summary: Xử lý xuất kho
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
 *                       type: string
 *                     serial_number:
 *                       type: string
 *     responses:
 *       200:
 *         description: Tạo phiếu xuất thành công
 */
// Create export document from order
router.post('/:id/export', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { serials } = req.body;
        const result = await OrderModule.exportOrder(req.params.id, req.user.id, serials);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, completed, cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update order status
router.put('/:id/status', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { status } = req.body;
        const result = await OrderModule.updateOrderStatus(req.params.id, status);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
