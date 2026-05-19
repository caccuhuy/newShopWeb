const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const CategoryModule = require('../modules/CategoryModule');

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
router.get('/', async (req, res, next) => {
    try {
        const categories = await CategoryModule.getAll();
        res.json(categories);
    } catch (err) {
        next(err);
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
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
    const { cat_name } = req.body;
    try {
        const result = await CategoryModule.create(cat_name);
        // Log activity asynchronously
        logActivity(req.user.id, `Thêm danh mục mới: ${cat_name}`, 'success').catch(console.error);
        res.status(201).json(result);
    } catch (err) {
        next(err);
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
router.put('/:id', verifyToken, isAdmin, async (req, res, next) => {
    const { cat_name } = req.body;
    try {
        const result = await CategoryModule.update(req.params.id, cat_name);
        logActivity(req.user.id, `Cập nhật tên danh mục thành: ${cat_name} (ID: ${req.params.id})`, 'info').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
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
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const result = await CategoryModule.delete(req.params.id);
        logActivity(req.user.id, `Xóa danh mục (ID: ${req.params.id})`, 'danger').catch(console.error);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
