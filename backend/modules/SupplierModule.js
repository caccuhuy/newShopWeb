const SupplierDAO = require('../dao/SupplierDAO');
const AppError = require('../utils/AppError');

class SupplierModule {
    static async getAll() {
        return await SupplierDAO.getAll();
    }

    static async create(taxId, name) {
        if (!taxId || !name) {
            throw new AppError('Thông tin nhà cung cấp không đầy đủ (Mã số thuế, Tên nhà cung cấp là bắt buộc)', 400);
        }

        await SupplierDAO.create(taxId, name);
        return { message: 'Supplier created' };
    }

    static async update(taxId, name) {
        if (!taxId) throw new AppError('Mã số thuế không hợp lệ', 400);
        if (!name) {
            throw new AppError('Tên nhà cung cấp không được để trống', 400);
        }

        await SupplierDAO.update(taxId, name);
        return { message: 'Supplier updated' };
    }

    static async delete(taxId) {
        if (!taxId) throw new AppError('Mã số thuế không hợp lệ', 400);

        try {
            await SupplierDAO.delete(taxId);
            return { message: 'Supplier deleted' };
        } catch (err) {
            if (err.message.includes('REFERENCE constraint') || err.message.includes('ràng buộc')) {
                throw new AppError('Không thể xóa nhà cung cấp đã có giao dịch nhập kho', 400);
            }
            throw err;
        }
    }
}

module.exports = SupplierModule;
