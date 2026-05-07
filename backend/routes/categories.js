const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý danh mục sản phẩm
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
// Get all categories
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Categories");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Thêm danh mục mới (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cat_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
// Create category (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { cat_name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, cat_name)
            .query("INSERT INTO Categories (cat_name) VALUES (@name)");
        
        await logActivity(req.user.id, `Thêm danh mục mới: ${cat_name}`, 'success');

        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cat_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update category (Admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { cat_name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, cat_name)
            .query("UPDATE Categories SET cat_name = @name WHERE cat_id = @id");
        
        await logActivity(req.user.id, `Cập nhật tên danh mục thành: ${cat_name} (ID: ${req.params.id})`, 'info');

        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa danh mục (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       400:
 *         description: Danh mục có sản phẩm ràng buộc
 */
// Delete category (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Check if any products belong to this category
        const check = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("SELECT COUNT(*) as count FROM Product WHERE cat_id = @id");
        
        if (check.recordset[0].count > 0) {
            return res.status(400).json({ error: 'Không thể xóa danh mục đang có sản phẩm. Vui lòng xóa sản phẩm trước.' });
        }

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM Categories WHERE cat_id = @id");
        
        await logActivity(req.user.id, `Xóa danh mục (ID: ${req.params.id})`, 'danger');

        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
