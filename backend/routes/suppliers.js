const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

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
