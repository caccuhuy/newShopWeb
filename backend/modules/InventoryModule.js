const InventoryDAO = require('../dao/InventoryDAO');
const AppError = require('../utils/AppError');

class InventoryModule {
    static async getDocs() {
        return await InventoryDAO.getDocs();
    }

    static async getDocDetail(docId) {
        if (!docId) throw new AppError('Mã phiếu kho không hợp lệ', 400);

        const recordset = await InventoryDAO.getDocDetail(docId);
        if (!recordset || recordset.length === 0) {
            throw new AppError('Không tìm thấy phiếu kho', 404);
        }

        const jsonString = Object.values(recordset[0])[0];
        if (!jsonString) {
            throw new AppError('Dữ liệu phiếu kho trống', 404);
        }

        return JSON.parse(jsonString);
    }

    static async validateSerial(serialNumber, docType) {
        if (!serialNumber) throw new AppError('Số serial không được để trống', 400);
        if (!docType) throw new AppError('Loại phiếu không hợp lệ', 400);

        const data = await InventoryDAO.validateSerial(serialNumber, parseInt(docType));
        if (!data) {
            throw new AppError('Lỗi không xác định khi kiểm tra Serial.', 404);
        }

        return {
            isValid: data.isValid,
            message: data.message,
            product: data.isValid && data.product_name ? {
                product_id: data.product_id,
                product_name: data.product_name,
                brand: data.brand
            } : null
        };
    }

    static async createDoc(docId, docType, Suppliers_tax_id, order_ref, Doc_description, details, createdBy) {
        if (!docId) throw new AppError('Mã phiếu không được để trống', 400);
        if (!docType) throw new AppError('Loại phiếu không được để trống', 400);
        if (!details || !Array.isArray(details) || details.length === 0) {
            throw new AppError('Danh sách sản phẩm chi tiết không được để trống', 400);
        }

        await InventoryDAO.importInventory(
            docId,
            docType,
            createdBy,
            Suppliers_tax_id,
            Doc_description,
            order_ref,
            details
        );

        const typeStr = parseInt(docType) === 1 ? 'Nhập kho' : (parseInt(docType) === 2 ? 'Xuất kho' : 'Chứng từ kho');
        return {
            message: 'Tạo phiếu kho thành công',
            doc_id: docId,
            typeStr
        };
    }

    static async updateDocDetails(docId, details) {
        if (!docId) throw new AppError('Mã phiếu kho không hợp lệ', 400);
        if (!details || !Array.isArray(details)) {
            throw new AppError('Danh sách chi tiết sản phẩm không hợp lệ', 400);
        }

        await InventoryDAO.updateInventoryDetails(docId, details);
        return { message: 'Cập nhật chi tiết phiếu thành công' };
    }

    static async updateDocStatus(docId, status) {
        if (!docId) throw new AppError('Mã phiếu kho không hợp lệ', 400);
        if (status !== 1 && status !== 2) {
            throw new AppError('Trạng thái cập nhật không hợp lệ (1: Duyệt, 2: Hủy)', 400);
        }

        await InventoryDAO.approveOrCancelInventoryDoc(docId, status);
        const statusStr = status === 1 ? 'Duyệt' : 'Hủy';
        const logType = status === 1 ? 'success' : 'warning';

        return {
            message: status === 1 ? 'Duyệt phiếu thành công' : 'Hủy phiếu thành công',
            statusStr,
            logType
        };
    }
}

module.exports = InventoryModule;
