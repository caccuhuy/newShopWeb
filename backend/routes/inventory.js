const express = require('express');
const router = express.Router();
const { verifyToken, isStaff } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const InventoryModule = require('../modules/InventoryModule');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Quản lý kho hàng (Nhập/Xuất)
 */

/**
 * @swagger
 * /api/inventory/docs:
 *   get:
 *     summary: Lấy danh sách tất cả phiếu kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phiếu kho
 */
// Get all inventory documents
router.get('/docs', verifyToken, isStaff, async (req, res, next) => {
    try {
        const docs = await InventoryModule.getDocs();
        res.json(docs);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu kho
 *     tags: [Inventory]
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
 *         description: Chi tiết phiếu kho kèm danh sách serial
 */
// Get document details
router.get('/docs/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const docDetail = await InventoryModule.getDocDetail(req.params.id);
        res.json(docDetail);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/inventory/validate-serial:
 *   post:
 *     summary: Kiểm tra tính hợp lệ của Serial theo loại phiếu
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serial_number:
 *                 type: string
 *               doc_type:
 *                 type: integer
 *                 description: "1: Nhập, 2: Xuất, 3: Trả NCC, 4: Nhận BH, 6: NCC Trả BH, 7: Trả BH khách"
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 */
// Validate serial number for a specific doc_type
router.post('/validate-serial', verifyToken, isStaff, async (req, res, next) => {
    const { serial_number, doc_type } = req.body;
    try {
        const result = await InventoryModule.validateSerial(serial_number, doc_type);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/inventory/docs:
 *   post:
 *     summary: Lập phiếu kho mới (Nhập/Xuất)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doc_id:
 *                 type: string
 *               doc_type:
 *                 type: integer
 *               Suppliers_tax_id:
 *                 type: string
 *               order_ref:
 *                 type: string
 *               Doc_description:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serial_number:
 *                       type: string
 *                     product_id:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Đã tạo phiếu thành công
 */
// Create new inventory document
router.post('/docs', verifyToken, isStaff, async (req, res, next) => {
    const { doc_id, doc_type, Suppliers_tax_id, order_ref, Doc_description, details } = req.body;
    try {
        const result = await InventoryModule.createDoc(
            doc_id,
            doc_type,
            Suppliers_tax_id,
            order_ref,
            Doc_description,
            details,
            req.user.id
        );
        logActivity(req.user.id, `Tạo phiếu ${result.typeStr} mới: ${doc_id}`, 'info').catch(console.error);
        res.status(201).json({ message: result.message, doc_id: result.doc_id });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}/details:
 *   put:
 *     summary: Cập nhật chi tiết phiếu kho (chỉ cho phiếu nháp)
 *     tags: [Inventory]
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
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serial_number:
 *                       type: string
 *                     product_id:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update document details (for Drafts)
router.put('/docs/:id/details', verifyToken, isStaff, async (req, res, next) => {
    const { details } = req.body;
    try {
        const result = await InventoryModule.updateDocDetails(req.params.id, details);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}/status:
 *   put:
 *     summary: Duyệt hoặc Hủy phiếu kho
 *     tags: [Inventory]
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
 *                 type: integer
 *                 description: "1: Duyệt, 2: Hủy"
 *     responses:
 *       200:
 *         description: Đã thay đổi trạng thái
 */
router.put('/docs/:id/status', verifyToken, isStaff, async (req, res, next) => {
    const { status } = req.body;
    try {
        const result = await InventoryModule.updateDocStatus(req.params.id, status);
        logActivity(req.user.id, `${result.statusStr} phiếu kho: ${req.params.id}`, result.logType).catch(console.error);
        res.json({ message: result.message });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
