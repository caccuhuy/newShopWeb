const express = require('express');
const router = express.Router();
const ProductModule = require('../modules/ProductModule');

/**
 * @swagger
 * tags:
 *   name: Customer Products
 *   description: Danh sách sản phẩm cho khách hàng
 */

/**
 * @swagger
 * /api/customer-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm hiển thị cho khách hàng
 *     tags: [Customer Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
// Get all customer-facing products with category and stock count
router.get('/', async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = await ProductModule.getAllCustomer(baseUrl);
        res.json(products);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/customer-products/search:
 *   get:
 *     summary: Tìm kiếm và lọc sản phẩm
 *     tags: [Customer Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 */
// Search and filter customer products
router.get('/search', async (req, res, next) => {
    const { q, category, brand, minPrice, maxPrice } = req.query;
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = await ProductModule.searchProducts(q, category, brand, minPrice, maxPrice, baseUrl);
        res.json(products);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
