const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// Get all customer-facing products with category and stock count
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.product_id, p.product_name, p.brand, p.unit_price, p.image_url, p.specs_json,
                   c.cat_name AS category_name,
                   (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
            FROM Product p
            LEFT JOIN Categories c ON p.cat_id = c.cat_id
            ORDER BY p.product_name
        `);

        const products = result.recordset.map(product => ({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: product.image_url,
            specs: product.specs_json,
            category: product.category_name,
            stock: product.stock
        }));

        res.json(products);
    } catch (err) {
        console.error('Customer products list error:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách sản phẩm' });
    }
});

// Search and filter customer products
router.get('/search', async (req, res) => {
    const { q, category, brand, minPrice, maxPrice } = req.query;
    const clauses = [];
    const request = (await poolPromise).request();

    if (q) {
        request.input('query', sql.NVarChar, `%${q}%`);
        clauses.push(`(p.product_name LIKE @query OR p.brand LIKE @query OR c.cat_name LIKE @query)`);
    }
    if (category) {
        request.input('category', sql.NVarChar, category);
        clauses.push('c.cat_name = @category');
    }
    if (brand) {
        request.input('brand', sql.NVarChar, brand);
        clauses.push('p.brand = @brand');
    }
    if (minPrice) {
        request.input('minPrice', sql.Decimal(18, 2), Number(minPrice));
        clauses.push('p.unit_price >= @minPrice');
    }
    if (maxPrice) {
        request.input('maxPrice', sql.Decimal(18, 2), Number(maxPrice));
        clauses.push('p.unit_price <= @maxPrice');
    }

    let query = `
        SELECT p.product_id, p.product_name, p.brand, p.unit_price, p.image_url, p.specs_json,
               c.cat_name AS category_name,
               (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
        FROM Product p
        LEFT JOIN Categories c ON p.cat_id = c.cat_id
    `;

    if (clauses.length > 0) {
        query += ' WHERE ' + clauses.join(' AND ');
    }

    query += ' ORDER BY p.product_name';

    try {
        const result = await request.query(query);
        const products = result.recordset.map(product => ({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: product.image_url,
            specs: product.specs_json,
            category: product.category_name,
            stock: product.stock
        }));
        res.json(products);
    } catch (err) {
        console.error('Customer product search error:', err);
        res.status(500).json({ error: 'Lỗi server khi tìm kiếm sản phẩm' });
    }
});

module.exports = router;
