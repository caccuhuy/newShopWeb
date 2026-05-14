const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

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
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_CustomerProducts');
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = result.recordset.map(product => {
            const imageUrl = product.image_url && product.image_url.startsWith('/uploads')
                ? `${baseUrl}${product.image_url}`
                : product.image_url;

            return {
                id: product.product_id,
                name: product.product_name,
                brand: product.brand,
                price: product.unit_price,
                image_url: imageUrl,
                specs: product.specs_json,
                category: product.category_name,
                stock: product.stock
            };
        });

        res.json(products);
    } catch (err) {
        console.error('Customer products list error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách sản phẩm' });
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
router.get('/search', async (req, res) => {
    const { q, category, brand, minPrice, maxPrice } = req.query;
    // const clauses = [];
    const request = (await poolPromise).request();

    request.input('query', sql.NVarChar, q || null);
    request.input('category', sql.NVarChar, category || null);
    request.input('brand', sql.NVarChar, brand || null);
    request.input('minPrice', sql.Decimal(18, 2), minPrice ? Number(minPrice) : null);
    request.input('maxPrice', sql.Decimal(18, 2), maxPrice ? Number(maxPrice) : null);

    try {
        const result = await request.execute('sp_SearchProducts');
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const products = result.recordset.map(product => {
            const imageUrl = product.image_url && product.image_url.startsWith('/uploads')
                ? `${baseUrl}${product.image_url}`
                : product.image_url;

            return {
                id: product.product_id,
                name: product.product_name,
                brand: product.brand,
                price: product.unit_price,
                image_url: imageUrl,
                specs: product.specs_json,
                category: product.category_name,
                stock: product.stock
            };
        });
        res.json(products);
    } catch (err) {
        console.error('Customer product search error:', err);
        res.status(500).json({ error: 'Lỗi server khi tìm kiếm sản phẩm' });
    }
});

module.exports = router;
