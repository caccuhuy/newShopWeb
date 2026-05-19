const CustomerDAO = require('../dao/CustomerDAO');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

class CustomerModule {
    static async getProfile(userId) {
        if (!userId) throw new AppError('Không tìm thấy mã người dùng', 400);
        
        const profile = await CustomerDAO.getProfile(userId);
        if (!profile) {
            throw new AppError('Không tìm thấy thông tin khách hàng', 404);
        }
        return profile;
    }

    static async updateProfile(userId, name, phoneNumber, defaultAddress, password = null) {
        if (!userId) throw new AppError('Không tìm thấy mã người dùng', 400);
        if (!name || !phoneNumber || !defaultAddress) {
            throw new AppError('Vui lòng điền đầy đủ thông tin hồ sơ', 400);
        }

        let passwordHash = null;
        if (password) {
            passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        }

        await CustomerDAO.updateProfile(userId, name, phoneNumber, defaultAddress, passwordHash);
        return { message: 'Cập nhật hồ sơ thành công' };
    }
}

module.exports = CustomerModule;
