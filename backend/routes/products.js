const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của sản phẩm
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *         brand:
 *           type: string
 *           description: Thương hiệu
 *         price:
 *           type: number
 *           description: Giá bán
 *         image_url:
 *           type: string
 *           description: Đường dẫn ảnh
 *         stock:
 *           type: integer
 *           description: Số lượng tồn kho
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Get all products
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_GetAllProducts');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = result.recordset.map(product => {
            let specs = {};
            try {
                specs = product.specs_json ? JSON.parse(product.specs_json) : {};
            } catch (parseErr) {
                specs = {};
            }

            const imageUrl = product.image_url && product.image_url.startsWith('/uploads')
                ? `${baseUrl}${product.image_url}`
                : product.image_url;

            return {
                id: product.product_id,
                name: product.product_name,
                brand: product.brand,
                price: product.unit_price,
                image_url: imageUrl,
                specs,
                specs_json: product.specs_json,
                cat_id: product.cat_id,
                category: product.category_name,
                stock: product.stock,
                warranty_period: product.warranty_period,
                description: product.description || ''
            };
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết một sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
// Get single product
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .execute('sp_GetProductDetails');
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Product not found' });

        const product = result.recordset[0];
        let specs = {};
        try {
            specs = product.specs_json ? JSON.parse(product.specs_json) : {};
        } catch (parseErr) {
            specs = {};
        }

        const imageUrl = product.image_url && product.image_url.startsWith('/uploads')
            ? `${req.protocol}://${req.get('host')}${product.image_url}`
            : product.image_url;

        res.json({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: imageUrl,
            specs,
            specs_json: product.specs_json,
            cat_id: product.cat_id,
            category: product.category_name,
            stock: product.stock,
            warranty_period: product.warranty_period,
            description: product.description || ''
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Thêm sản phẩm mới (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *               cat_id:
 *                 type: integer
 *               unit_price:
 *                 type: number
 *               brand:
 *                 type: string
 *               warranty_period:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo
 */
// Create product (Admin)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { product_name, cat_id, specs_json, unit_price, brand, warranty_period } = req.body;
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, product_name)
            .input('cat', sql.Int, cat_id)
            .input('specs', sql.NVarChar, specs_json)
            .input('price', sql.Decimal(15, 2), unit_price)
            .input('brand', sql.VarChar, brand)
            .input('warranty', sql.Int, warranty_period)
            .input('img', sql.VarChar, image_url)
            .execute('sp_AddProducts');
            
        
        await logActivity(req.user.id, `Thêm sản phẩm mới: ${product_name}`, 'success');

        res.status(201).json({ message: 'Product created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm (Admin)
 *     tags: [Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *               cat_id:
 *                 type: integer
 *               unit_price:
 *                 type: number
 *               brand:
 *                 type: string
 *               warranty_period:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update product (Admin)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { product_name, cat_id, specs_json, unit_price, brand, warranty_period } = req.body;
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
            .input('warranty', sql.Int, warranty_period)
            .input('img', sql.VarChar, image_url)
            .execute('sp_AlterProducts');
        await logActivity(req.user.id, `Cập nhật thông tin sản phẩm: ${product_name} (ID: ${req.params.id})`, 'info');

        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Admin)
 *     tags: [Products]
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
 *         description: Không thể xóa sản phẩm có dữ liệu ràng buộc
 */
// Delete product (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const id = req.params.id;

        // Check FK constraints (Orders, DOC_Details, Stock_Units)
        const prod = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT image_url FROM Product WHERE product_id = @id");

            if (prod.recordset.length === 0) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
            }
            const imgUrl = prod.recordset[0].image_url;

            // 2. Chạy Procedure kiểm tra ràng buộc và thực hiện xóa
            const result = await pool.request()
                .input('id', sql.Int, id)
                .execute('sp_DeleteProductWithCheck');

            const { orderCount, docCount, stockCount, isDeleted } = result.recordset[0];

            // 3. Nếu không xóa được do có ràng buộc khóa ngoại
            if (isDeleted === 0) {
                return res.status(400).json({ 
                    error: 'Không thể xóa sản phẩm đã có giao dịch.',
                    details: { orders: orderCount, docs: docCount, stock: stockCount }
                });
            }
            
        // Delete physical file
        if (imgUrl && imgUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../public', imgUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await logActivity(req.user.id, `Xóa sản phẩm (ID: ${req.params.id})`, 'danger');

        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
