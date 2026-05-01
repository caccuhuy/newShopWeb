const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get all products
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.*, c.cat_name as category_name,
                   (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) as stock
            FROM Product p 
            LEFT JOIN Categories c ON p.cat_id = c.cat_id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("SELECT * FROM Product WHERE product_id = @id");
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product (Admin)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { product_name, cat_id, specs_json, unit_price, brand, waraty_period } = req.body;
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, product_name)
            .input('cat', sql.Int, cat_id)
            .input('specs', sql.NVarChar, specs_json)
            .input('price', sql.Decimal(18, 2), unit_price)
            .input('brand', sql.VarChar, brand)
            .input('warranty', sql.Int, waraty_period)
            .input('img', sql.VarChar, image_url)
            .query(`INSERT INTO Product (product_name, cat_id, specs_json, unit_price, brand, waraty_period, image_url) 
                    VALUES (@name, @cat, @specs, @price, @brand, @warranty, @img)`);
        res.status(201).json({ message: 'Product created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product (Admin)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { product_name, cat_id, specs_json, unit_price, brand, waraty_period } = req.body;
    let image_url = req.body.image_url; // Use existing if no new file

    if (req.file) {
        image_url = `/uploads/products/${req.file.filename}`;
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, product_name)
            .input('cat', sql.Int, cat_id)
            .input('specs', sql.NVarChar, specs_json)
            .input('price', sql.Decimal(18, 2), unit_price)
            .input('brand', sql.VarChar, brand)
            .input('warranty', sql.Int, waraty_period)
            .input('img', sql.VarChar, image_url)
            .query(`UPDATE Product SET 
                        product_name = @name, 
                        cat_id = @cat, 
                        specs_json = @specs, 
                        unit_price = @price, 
                        brand = @brand, 
                        waraty_period = @warranty, 
                        image_url = @img 
                    WHERE product_id = @id`);
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;

        // Check FK constraints (Orders, DOC_Details, Stock_Units)
        const check = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Order_Details WHERE product_id = @id) as orderCount,
                    (SELECT COUNT(*) FROM DOC_Details WHERE product_id = @id) as docCount,
                    (SELECT COUNT(*) FROM Stock_Units WHERE product_id = @id) as stockCount
            `);
        
        const { orderCount, docCount, stockCount } = check.recordset[0];
        if (orderCount > 0 || docCount > 0 || stockCount > 0) {
            return res.status(400).json({ 
                error: 'Không thể xóa sản phẩm đã có dữ liệu giao dịch hoặc tồn kho. Vui lòng ẩn sản phẩm này thay vì xóa.' 
            });
        }

        // Get image to delete file
        const prod = await pool.request().input('id', sql.Int, req.params.id).query("SELECT image_url FROM Product WHERE product_id = @id");
        const imgUrl = prod.recordset[0]?.image_url;

        await pool.request().input('id', sql.Int, req.params.id).query("DELETE FROM Product WHERE product_id = @id");
        
        // Delete physical file
        if (imgUrl && imgUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../public', imgUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
