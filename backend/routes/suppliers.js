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
        const result = await pool.request().query("SELECT tax_id, supplier_name FROM Suppliers");
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
            .input('tax', sql.VarChar, tax_id)
            .input('name', sql.NVarChar, supplier_name)
            .query("INSERT INTO Suppliers (tax_id, supplier_name) VALUES (@tax, @name)");
        
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
            .input('tax', sql.VarChar, req.params.tax_id)
            .input('name', sql.NVarChar, supplier_name)
            .query("UPDATE Suppliers SET supplier_name = @name WHERE tax_id = @tax");
        
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
        
        // Check if supplier is in use in Inventory_DOCs
        const check = await pool.request()
            .input('tax', sql.VarChar, req.params.tax_id)
            .query("SELECT COUNT(*) as count FROM Inventory_DOCs WHERE Suppliers_tax_id = @tax");
        
        if (check.recordset[0].count > 0) {
            return res.status(400).json({ error: 'Không thể xóa nhà cung cấp đã có lịch sử nhập/xuất kho.' });
        }

        await pool.request()
            .input('tax', sql.VarChar, req.params.tax_id)
            .query("DELETE FROM Suppliers WHERE tax_id = @tax");
        
        await logActivity(req.user.id, `Xóa nhà cung cấp (MST: ${req.params.tax_id})`, 'danger');

        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
