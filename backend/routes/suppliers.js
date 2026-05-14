const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

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
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_Suppliers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { tax_id, supplier_name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('tax', sql.Char(10), tax_id)
            .input('name', sql.NVarChar, supplier_name)
            .execute('sp_AddSupplier');
        
        await logActivity(req.user.id, `Thêm nhà cung cấp mới: ${supplier_name} (MST: ${tax_id})`, 'success');

        res.status(201).json({ message: 'Supplier created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
router.put('/:tax_id', verifyToken, isAdmin, async (req, res) => {
    const { supplier_name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('tax', sql.Char(10), req.params.tax_id)
            .input('name', sql.NVarChar, supplier_name)
            .execute('sp_UpdateSupplier');
        
        await logActivity(req.user.id, `Cập nhật thông tin nhà cung cấp: ${supplier_name} (MST: ${req.params.tax_id})`, 'info');

        res.json({ message: 'Supplier updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
router.delete('/:tax_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        await pool.request()
            .input('tax', sql.Char(10), req.params.tax_id)
            .execute('sp_DeleteSupplier');

        // Ghi log hoạt động sau khi xóa thành công
        await logActivity(req.user.id, `Xóa nhà cung cấp (MST: ${req.params.tax_id})`, 'danger');

        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
