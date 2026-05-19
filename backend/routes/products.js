const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const ProductModule = require('../modules/ProductModule');
const multer = require('multer');
const path = require('path');

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
router.get('/', async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = await ProductModule.getAllAdmin(baseUrl);
        res.json(products);
    } catch (err) {
        next(err);
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
router.get('/:id', async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const product = await ProductModule.getById(req.params.id, baseUrl);
        res.json(product);
    } catch (err) {
        next(err);
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
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res, next) => {
    const { product_name, cat_id, specs_json, unit_price, brand, warranty_period } = req.body;
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

    try {
        const result = await ProductModule.create(
            product_name,
            cat_id,
            specs_json,
            unit_price,
            brand,
            warranty_period,
            imageUrl
        );
        logActivity(req.user.id, `Thêm sản phẩm mới: ${product_name}`, 'success').catch(console.error);
        res.status(201).json(result);
    } catch (err) {
        next(err);
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
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res, next) => {
    const { product_name, cat_id, specs_json, unit_price, brand, warranty_period } = req.body;
    let imageUrl = req.body.image_url;

    if (req.file) {
        imageUrl = `/uploads/products/${req.file.filename}`;
    }

    try {
        const result = await ProductModule.update(
            req.params.id,
            product_name,
            cat_id,
            specs_json,
            unit_price,
            brand,
            warranty_period,
            imageUrl
        );
        logActivity(req.user.id, `Cập nhật thông tin sản phẩm: ${product_name} (ID: ${req.params.id})`, 'info').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
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
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const result = await ProductModule.delete(req.params.id);
        logActivity(req.user.id, `Xóa sản phẩm (ID: ${req.params.id})`, 'danger').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
