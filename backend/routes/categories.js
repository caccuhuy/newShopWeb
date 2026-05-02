const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

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
