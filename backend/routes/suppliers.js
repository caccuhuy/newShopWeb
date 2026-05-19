const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const SupplierModule = require('../modules/SupplierModule');

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Quản lý nhà cung cấp
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Lấy danh sách nhà cung cấp
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: Danh sách nhà cung cấp
 */
// Get all suppliers
router.get('/', async (req, res, next) => {
    try {
        const suppliers = await SupplierModule.getAll();
        res.json(suppliers);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Thêm nhà cung cấp mới (Admin)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tax_id:
 *                 type: string
 *               supplier_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
// Create supplier (Admin)
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
    const { tax_id, supplier_name } = req.body;
    try {
        const result = await SupplierModule.create(tax_id, supplier_name);
        logActivity(req.user.id, `Thêm nhà cung cấp mới: ${supplier_name} (MST: ${tax_id})`, 'success').catch(console.error);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/suppliers/{tax_id}:
 *   put:
 *     summary: Cập nhật nhà cung cấp (Admin)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tax_id
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
 *               supplier_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update supplier (Admin)
router.put('/:tax_id', verifyToken, isAdmin, async (req, res, next) => {
    const { supplier_name } = req.body;
    try {
        const result = await SupplierModule.update(req.params.tax_id, supplier_name);
        logActivity(req.user.id, `Cập nhật thông tin nhà cung cấp: ${supplier_name} (MST: ${req.params.tax_id})`, 'info').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/suppliers/{tax_id}:
 *   delete:
 *     summary: Xóa nhà cung cấp (Admin)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tax_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       400:
 *         description: Nhà cung cấp đã có lịch sử kho
 */
// Delete supplier (Admin)
router.delete('/:tax_id', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const result = await SupplierModule.delete(req.params.tax_id);
        logActivity(req.user.id, `Xóa nhà cung cấp (MST: ${req.params.tax_id})`, 'danger').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
