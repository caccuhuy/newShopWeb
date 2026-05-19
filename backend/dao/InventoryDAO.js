const { sql, poolPromise } = require('../config/db');

class InventoryDAO {
    static async getDocs() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_GetAllDoc');
        return result.recordset;
    }

    static async getDocDetail(docId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('docId', sql.Char(10), docId)
            .execute('sp_GetInventoryDocDetail');
        return result.recordset;
    }

    static async validateSerial(serialNumber, docType) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('serial_number', sql.VarChar, serialNumber)
            .input('doc_type', sql.Int, docType)
            .execute('sp_ValidateSerialNumber');
        return result.recordset[0];
    }

    static createStockItemTable(details) {
        const detailTable = new sql.Table('StockItemType');
        detailTable.columns.add('product_id', sql.Int);
        detailTable.columns.add('serial_number', sql.VarChar(50));
        detailTable.columns.add('unit_price', sql.Decimal(18, 2));

        if (details && Array.isArray(details)) {
            details.forEach(item => {
                detailTable.rows.add(item.product_id, item.serial_number, item.unit_price || 0);
            });
        }
        return detailTable;
    }

    static async importInventory(docId, docType, createdBy, taxId, desc, orderRef, details) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        const detailTable = InventoryDAO.createStockItemTable(details);

        try {
            await transaction.begin();

            const headerRequest = new sql.Request(transaction);
            await headerRequest
                .input('doc_id', sql.Char(10), docId)
                .input('doc_type', sql.TinyInt, docType)
                .input('created_by', sql.VarChar, createdBy || '0001')
                .input('tax_id', sql.VarChar, taxId || null)
                .input('desc', sql.NVarChar, desc || '')
                .input('status', sql.TinyInt, 0) // Draft
                .input('inv_id', sql.TinyInt, 1) // Default inventory
                .input('order_ref', sql.VarChar, orderRef || null)
                .input('details', detailTable);

            await headerRequest.execute('sp_ImportInventory');

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    static async updateInventoryDetails(docId, details) {
        const pool = await poolPromise;
        const detailTable = InventoryDAO.createStockItemTable(details);

        await pool.request()
            .input('docId', sql.Char(10), docId)
            .input('details', detailTable)
            .execute('sp_UpdateInventoryDetails');
    }

    static async approveOrCancelInventoryDoc(docId, targetStatus) {
        const pool = await poolPromise;
        await pool.request()
            .input('docId', sql.Char(10), docId)
            .input('targetStatus', sql.TinyInt, targetStatus)
            .execute('sp_ApproveOrCancelInventoryDoc');
    }
}

module.exports = InventoryDAO;
