const { sql, poolPromise } = require('../config/db');
const AppError = require('../utils/AppError');

class OrderDAO {
    // 1. Lấy toàn bộ đơn hàng (Cho Admin/Staff)
    static async getAllOrders() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_AllOrders');
        return result.recordset;
    }

    // 2. Lấy danh sách đơn hàng cá nhân (Cho Customer)
    static async getCustomerOrders(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, userId)
            .execute('sp_GetCustomerOrders');
        return result.recordset;
    }

    // 3. Lấy chi tiết một đơn hàng cụ thể
    static async getOrderDetail(orderId, userId = null) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('orderId', sql.VarChar, orderId)
            .execute('sp_GetOrderAdminDetail');
        
        if (!result.recordset || result.recordset.length === 0) {
            throw new AppError('Không tìm thấy đơn hàng', 404);
        }

        const jsonString = Object.values(result.recordset[0])[0];
        if (!jsonString) {
            throw new AppError('Không tìm thấy đơn hàng', 404);
        }

        const orderData = JSON.parse(jsonString);

        if (userId && orderData.user_id !== userId) {
            throw new AppError('Không có quyền truy cập đơn hàng này', 403);
        }

        if (orderData.items) {
            orderData.items.forEach(item => {
                if (typeof item.serials_raw === 'string') {
                    item.serials = JSON.parse('[' + item.serials_raw + ']');
                } else {
                    item.serials = [];
                }
                delete item.serials_raw;
            });
        }

        return orderData;
    }

    // 4. Lấy Serial khả dụng để chuẩn bị xuất kho (Staff)
    static async getAvailableSerialsForOrder(orderId) {
        const pool = await poolPromise;
        const itemsResult = await pool.request()
            .input('orderId', sql.VarChar, orderId)
            .execute('sp_GetOrderStockReport');
            
        if (!itemsResult.recordset || itemsResult.recordset.length === 0) {
            return [];
        }

        const jsonString = Object.values(itemsResult.recordset[0])[0];
        if (!jsonString) return [];

        let stockReport = JSON.parse(jsonString);

        return stockReport.map(item => ({
            ...item,
            available_serials: item.available_serials_raw 
                ? item.available_serials_raw.map(s => s.serial_number) 
                : []
        }));
    }

    // 5. Tạo Phiếu Xuất Kho từ Đơn Hàng (Staff)
    static async createExportDocFromOrder(orderId, staffId, serials) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        const detailTable = new sql.Table('StockItemType');
        detailTable.columns.add('product_id', sql.Int);
        detailTable.columns.add('serial_number', sql.VarChar(50));
        detailTable.columns.add('unit_price', sql.Decimal(18, 2));

        serials.forEach(item => {
            detailTable.rows.add(item.product_id, item.serial_number, item.unit_price || 0);
        });

        try {
            await transaction.begin();
            
            const docId = `EX-${Date.now().toString().slice(-7)}`;
            
            const docRequest = new sql.Request(transaction);
            await docRequest.input('doc_id', sql.Char(10), docId)
                .input('staffId', sql.VarChar, staffId)
                .input('orderId', sql.VarChar, orderId)
                .input('details', detailTable)
                .execute('sp_ConfirmOrderAndCreateExport');

            await transaction.commit();
            return docId;
        } catch (err) {
            if (transaction && transaction._aborted === false) {
                try {
                    await transaction.rollback();
                } catch (e) {}
            }
            throw err;
        }
    }

    // 6. Cập nhật trạng thái đơn hàng (Staff)
    static async updateOrderStatus(orderId, status) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.VarChar, orderId)
            .input('status', sql.VarChar, status)
            .execute('sp_ChangeOrderStatus');
    }

    // 7. Tạo Đơn Hàng Mới (Customer)
    static async createCustomerOrder(orderId, userId, totalAmount, shippingAddress, items) {
        const pool = await poolPromise;
        
        // Bảng tạm (TVP) để insert nhiều dòng vào Order_Details trong một transaction
        const itemTable = new sql.Table('OrderItemType'); 
        itemTable.columns.add('product_id', sql.Int);
        itemTable.columns.add('quantity', sql.Int);
        itemTable.columns.add('unit_price', sql.Decimal(18, 2));
        
        items.forEach(item => {
            itemTable.rows.add(
                parseInt(item.id || item.product_id), 
                parseInt(item.quantity) || 1,
                parseFloat(item.price || item.unit_price) || 0
            );
        });

        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            await request
                .input('orderId', sql.VarChar, orderId)
                .input('userId', sql.VarChar, userId)
                .input('total_amount', sql.Decimal(18, 2), totalAmount)
                .input('status', sql.VarChar, 'pending')
                .input('shipping_address', sql.NVarChar, shippingAddress)
                .input('items', itemTable)
                .execute('sp_AddNewOrder');

            await transaction.commit();
        } catch (err) {
            if (transaction && transaction._aborted === false) {
                try {
                    await transaction.rollback();
                } catch (rollbackErr) {
                    console.error('Rollback error:', rollbackErr);
                }
            }
            throw err;
        }
    }
}

module.exports = OrderDAO;
