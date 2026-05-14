const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Quản lý kho hàng (Nhập/Xuất)
 */

/**
 * @swagger
 * /api/inventory/docs:
 *   get:
 *     summary: Lấy danh sách tất cả phiếu kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phiếu kho
 */
// Get all inventory documents
router.get('/docs', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_GetAllDoc')
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phiếu kho kèm danh sách serial
 */
// Get document details
router.get('/docs/:id', verifyToken, isStaff, async (req, res) => {
    try {
        const pool = await poolPromise;
        const docResult = await pool.request()
            .input('id', sql.Char(10), req.params.id)
            .execute('sp_GetInventoryDocDetail');

        if (!docResult.recordset || docResult.recordset.length === 0 || !docResult.recordset[0]['']) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu kho' });
        }

        const inventoryData = JSON.parse(docResult.recordset[0]['']);
        res.json(inventoryData);
        // res.json({
        //     ...docResult.recordset[0],
        //     details: detailsResult.recordset
        // });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/inventory/validate-serial:
 *   post:
 *     summary: Kiểm tra tính hợp lệ của Serial theo loại phiếu
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serial_number:
 *                 type: string
 *               doc_type:
 *                 type: integer
 *                 description: "1: Nhập, 2: Xuất, 3: Trả NCC, 4: Nhận BH, 6: NCC Trả BH, 7: Trả BH khách"
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 */
// Validate serial number for a specific doc_type
router.post('/validate-serial', verifyToken, isStaff, async (req, res) => {
    const { serial_number, doc_type } = req.body;
    
    try {
        const pool = await poolPromise;
        const snResult = await pool.request()
            .input('serial_number', sql.VarChar, serial_number)
            .input('doc_type', sql.Int, parseInt(doc_type))
            .execute('sp_ValidateSerialNumber');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Lỗi không xác định khi kiểm tra Serial.' });
        }

        // doc_type: 1: Nhập, 2: Xuất, 3: Trả NCC, 4: Nhận BH, 6: NCC Trả BH, 7: Trả BH khách
        const data = result.recordset[0];
        res.json({
            isValid: data.isValid,
            message: data.message,
            product: data.isValid && data.product_name ? {
                product_id: data.product_id,
                product_name: data.product_name,
                brand: data.brand
            } : null
        });

        res.json({ isValid, message, product, snData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/inventory/docs:
 *   post:
 *     summary: Lập phiếu kho mới (Nhập/Xuất)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doc_id:
 *                 type: string
 *               doc_type:
 *                 type: integer
 *               Suppliers_tax_id:
 *                 type: string
 *               order_ref:
 *                 type: string
 *               Doc_description:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serial_number:
 *                       type: string
 *                     product_id:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Đã tạo phiếu thành công
 */
// Create new inventory document
router.post('/docs', verifyToken, isStaff, async (req, res) => {
    const { doc_id, doc_type, Suppliers_tax_id, order_ref, Doc_description, details } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    // 1. Chuẩn bị Table-Valued Parameter (TVP)
    const detailTable = new sql.Table('StockItemType');
    detailTable.columns.add('product_id', sql.Int);
    detailTable.columns.add('serial_number', sql.VarChar(50));
    detailTable.columns.add('unit_price', sql.Decimal(18, 2));
    // Đổ dữ liệu từ array details vào bảng TVP
    details.forEach(item => {
        detailTable.rows.add(item.product_id, item.serial_number, item.unit_price || 0);
    });

    try {
        await transaction.begin();

        // 1. Insert Header
        const headerRequest = new sql.Request(transaction);
        await headerRequest
            .input('doc_id', sql.Char(10), doc_id)
            .input('doc_type', sql.TinyInt, doc_type)
            .input('created_by', sql.VarChar, req.user.id || '0001')
            .input('tax_id', sql.VarChar, Suppliers_tax_id || null)
            .input('desc', sql.NVarChar, Doc_description || '')
            .input('status', sql.TinyInt, 0) // Draft
            .input('inv_id', sql.TinyInt, 1) // Default inventory
            .input('order_ref', sql.VarChar, order_ref || null)
            .input('details', detailTable);
        await headerRequest.execute('sp_ImportInventory');

        await transaction.commit();
        
        const typeStr = parseInt(doc_type) === 1 ? 'Nhập kho' : (parseInt(doc_type) === 2 ? 'Xuất kho' : 'Chứng từ kho');
        await logActivity(req.user.id, `Tạo phiếu ${typeStr} mới: ${doc_id}`, 'info');

        res.status(201).json({ message: 'Tạo phiếu kho thành công', doc_id });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}/details:
 *   put:
 *     summary: Cập nhật chi tiết phiếu kho (chỉ cho phiếu nháp)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serial_number:
 *                       type: string
 *                     product_id:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Update document details (for Drafts)
router.put('/docs/:id/details', verifyToken, isStaff, async (req, res) => {
    const { details } = req.body;
    const docId = req.params.id; 

    try {
        const pool = await poolPromise;
        try{
        const detailTable = new sql.Table('StockItemType');
        detailTable.columns.add('product_id', sql.Int);
        detailTable.columns.add('serial_number', sql.VarChar(50));
        detailTable.columns.add('unit_price', sql.Decimal(18, 2));
        // Đổ dữ liệu từ array details vào bảng TVP
        details.forEach(item => {
            detailTable.rows.add(item.product_id, item.serial_number, item.unit_price || 0);
        });
        
        // 1. Check if doc exists and is in Draft (0)
        const checkResult = await pool.request()
            .input('id', sql.Char(10), docId)
            .input('details', detailTable);

        await checkResult.execute('sp_UpdateInventoryDetails');
            res.json({ message: 'Cập nhật chi tiết phiếu thành công' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/inventory/docs/{id}/status:
 *   put:
 *     summary: Duyệt hoặc Hủy phiếu kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 description: "1: Duyệt, 2: Hủy"
 *     responses:
 *       200:
 *         description: Đã thay đổi trạng thái
 */
router.put('/docs/:id/status', verifyToken, isStaff, async (req, res) => {
    const { status } = req.body; // 1: Approve, 2: Cancel
    const docId = req.params.id;

    try {
        const pool = await poolPromise;
        try{

        // Check if doc exists and is in Draft (0)
        const checkResult = await pool.request()
            .input('id', sql.Char(10), docId)
            .input('status', sql.TinyInt, status);
        await checkResult.execute('sp_ApproveOrCancelInventoryDoc');
            
            const statusStr = status === 1 ? 'Duyệt' : 'Hủy';
            const logType = status === 1 ? 'success' : 'warning';
            await logActivity(req.user.id, `${statusStr} phiếu kho: ${docId}`, logType);

            res.json({ message: status === 1 ? 'Duyệt phiếu thành công' : 'Hủy phiếu thành công' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
