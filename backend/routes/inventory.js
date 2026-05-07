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
        const result = await pool.request().query(`
            SELECT idoc.*, s.supplier_name, o.order_id as order_ref_id
            FROM Inventory_DOCs idoc
            LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
            LEFT JOIN Orders o ON idoc.order_ref = o.order_id
            ORDER BY idoc.created_at DESC
        `);
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
            .query(`
                SELECT idoc.*, s.supplier_name 
                FROM Inventory_DOCs idoc
                LEFT JOIN Suppliers s ON idoc.Suppliers_tax_id = s.tax_id
                WHERE idoc.doc_id = @id
            `);

        if (docResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu kho' });
        }

        const detailsResult = await pool.request()
            .input('id', sql.Char(10), req.params.id)
            .query(`
                SELECT dd.*, p.product_name, p.brand
                FROM DOC_Details dd
                JOIN Product p ON dd.product_id = p.product_id
                WHERE dd.doc_id = @id
            `);

        res.json({
            ...docResult.recordset[0],
            details: detailsResult.recordset
        });
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
            .input('sn', sql.VarChar, serial_number)
            .query("SELECT * FROM Stock_Units WHERE serial_number = @sn");

        const exists = snResult.recordset.length > 0;
        const snData = exists ? snResult.recordset[0] : null;

        let isValid = false;
        let message = '';
        let product = null;

        // doc_type: 1: Nhập, 2: Xuất, 3: Trả NCC, 4: Nhận BH, 6: NCC Trả BH, 7: Trả BH khách
        switch (parseInt(doc_type)) {
            case 1: // Nhập kho
                if (exists && snData.status !== 0) { // Assuming 0 is Deleted or something, but usually shouldn't exist
                    isValid = false;
                    message = 'Số Serial này đã tồn tại trong hệ thống.';
                } else {
                    isValid = true;
                    message = 'Serial hợp lệ để nhập mới.';
                }
                break;
            case 2: // Xuất kho
                if (!exists) {
                    isValid = false;
                    message = 'Số Serial không tồn tại trong kho.';
                } else if (snData.status !== 1) {
                    isValid = false;
                    message = `Serial không khả dụng (Trạng thái hiện tại: ${snData.status}).`;
                } else {
                    isValid = true;
                    const pResult = await pool.request().input('pid', sql.Int, snData.product_id).query("SELECT product_name, brand FROM Product WHERE product_id = @pid");
                    product = pResult.recordset[0];
                }
                break;
            // Add other types as needed
            default:
                isValid = exists;
                message = exists ? 'Tìm thấy Serial' : 'Không tìm thấy Serial';
        }

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
            .query(`
                INSERT INTO Inventory_DOCs (doc_id, doc_type, created_by, Suppliers_tax_id, Doc_description, status, inventory_id, order_ref)
                VALUES (@doc_id, @doc_type, @created_by, @tax_id, @desc, @status, @inv_id, @order_ref)
            `);

        // 2. Insert Details
        for (const item of details) {
            // For Imports (doc_type 1), we need to ensure the serial exists in Stock_Units first
            // due to the FK constraint.
            if (parseInt(doc_type) === 1) {
                const checkSnRequest = new sql.Request(transaction);
                const snCheck = await checkSnRequest
                    .input('sn', sql.VarChar, item.serial_number)
                    .query("SELECT 1 FROM Stock_Units WHERE serial_number = @sn");

                if (snCheck.recordset.length === 0) {
                    const insertSnRequest = new sql.Request(transaction);
                    await insertSnRequest
                        .input('sn', sql.VarChar, item.serial_number)
                        .input('pid', sql.Int, item.product_id)
                        .input('status', sql.TinyInt, 0) // Status 0: Pending Import
                        .query("INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, @status)");
                }
            }

            const detailRequest = new sql.Request(transaction);
            await detailRequest
                .input('doc_id', sql.Char(10), doc_id)
                .input('sn', sql.VarChar, item.serial_number)
                .input('pid', sql.Int, item.product_id)
                .input('price', sql.Decimal(18, 2), item.unit_price || 0)
                .query(`
                    INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                    VALUES (@doc_id, @sn, @pid, @price)
                `);
        }

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
        
        // 1. Check if doc exists and is in Draft (0)
        const checkResult = await pool.request()
            .input('id', sql.Char(10), docId)
            .query("SELECT status, doc_type FROM Inventory_DOCs WHERE doc_id = @id");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu kho' });
        }

        if (checkResult.recordset[0].status !== 0) {
            return res.status(400).json({ error: 'Chỉ có thể cập nhật chi tiết cho phiếu đang ở trạng thái Chờ duyệt.' });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 2. Delete old details
            await transaction.request()
                .input('id', sql.Char(10), docId)
                .query("DELETE FROM DOC_Details WHERE doc_id = @id");

            // 3. Insert new details
            for (const item of details) {
                // Check doc_type from checkResult (fetched earlier in this route)
                const docType = checkResult.recordset[0].doc_type;

                if (parseInt(docType) === 1) {
                    const checkSnRequest = new sql.Request(transaction);
                    const snCheck = await checkSnRequest
                        .input('sn', sql.VarChar, item.serial_number)
                        .query("SELECT 1 FROM Stock_Units WHERE serial_number = @sn");

                    if (snCheck.recordset.length === 0) {
                        const insertSnRequest = new sql.Request(transaction);
                        await insertSnRequest
                            .input('sn', sql.VarChar, item.serial_number)
                            .input('pid', sql.Int, item.product_id)
                            .input('status', sql.TinyInt, 0) // Status 0: Pending Import
                            .query("INSERT INTO Stock_Units (serial_number, product_id, status) VALUES (@sn, @pid, @status)");
                    }
                }

                const detailRequest = new sql.Request(transaction);
                await detailRequest
                    .input('doc_id', sql.Char(10), docId)
                    .input('sn', sql.VarChar, item.serial_number)
                    .input('pid', sql.Int, item.product_id)
                    .input('price', sql.Decimal(18, 2), item.unit_price || 0)
                    .query(`
                        INSERT INTO DOC_Details (doc_id, serial_number, product_id, unit_price)
                        VALUES (@doc_id, @sn, @pid, @price)
                    `);
            }

            await transaction.commit();
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
        
        // Check if doc exists and is in Draft (0)
        const checkResult = await pool.request()
            .input('id', sql.Char(10), docId)
            .query("SELECT status, doc_type, order_ref FROM Inventory_DOCs WHERE doc_id = @id");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu kho' });
        }

        const { status: currentStatus, doc_type, order_ref } = checkResult.recordset[0];
        if (currentStatus !== 0) {
            return res.status(400).json({ error: 'Chỉ có thể Duyệt/Hủy phiếu đang ở trạng thái Chờ duyệt.' });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Update status - This will fire trg_HandleInventoryApproval
            await transaction.request()
                .input('id', sql.Char(10), docId)
                .input('status', sql.TinyInt, status)
                .query("UPDATE Inventory_DOCs SET status = @status WHERE doc_id = @id");

            // 2. Link with Order status if applicable
            if (order_ref) {
                const orderRequest = new sql.Request(transaction);
                orderRequest.input('order_id', sql.VarChar, order_ref);

                if (status === 1 && doc_type === 2) {
                    // Approved Export -> Complete Order
                    await orderRequest.query("UPDATE Orders SET status = 'completed' WHERE order_id = @order_id");
                } else if (status === 2) {
                    // Cancelled Document -> Revert Order to Pending (so it can be re-processed)
                    await orderRequest.query("UPDATE Orders SET status = 'pending' WHERE order_id = @order_id");
                }
            }

            await transaction.commit();
            
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
