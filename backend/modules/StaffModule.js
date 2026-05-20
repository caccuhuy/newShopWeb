const StaffDAO = require('../dao/StaffDAO');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

class StaffModule {
    static async getAll() {
        return await StaffDAO.getAll();
    }

    static async create(name, email, phoneNumber, role) {
        if (!name || !email || !phoneNumber || !role) {
            throw new AppError('Vui lòng điền đầy đủ thông tin', 400);
        }

        // Mật khẩu mặc định '123456'
        const hash = crypto.createHash('sha256').update('123456').digest('hex');

        const result = await StaffDAO.create(name, email, phoneNumber, role, hash);
        if (!result || !result.newUserId) {
            throw new AppError('Thêm nhân viên thất bại', 400);
        }
        return {
            newUserId: result.newUserId,
            message: 'Thêm nhân viên thành công'
        };
    }

    static async toggleActive(targetId, adminId, isActive) {
        if (!targetId || !adminId) throw new AppError('Dữ liệu không đầy đủ', 400);

        const result = await StaffDAO.toggleActive(targetId, adminId, isActive);
        if (!result || !result.username) {
            throw new AppError('Cập nhật trạng thái thất bại', 400);
        }
        return {
            username: result.username,
            message: 'Cập nhật trạng thái thành công'
        };
    }

    static async resetPassword(userId, password) {
        if (!userId) throw new AppError('Mã người dùng không hợp lệ', 400);
        if (!password) throw new AppError('Mật khẩu không được để trống', 400);

        const hash = crypto.createHash('sha256').update(password).digest('hex');
        await StaffDAO.resetPassword(userId, hash);
        return { message: 'Reset mật khẩu thành công' };
    }

    static async changePassword(userId, currentPassword, newPassword) {
        if (!userId) throw new AppError('Mã người dùng không hợp lệ', 400);
        if (!currentPassword || !newPassword) throw new AppError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới', 400);

        const currentHashDb = await StaffDAO.getPasswordHash(userId);
        if (!currentHashDb) throw new AppError('Không tìm thấy tài khoản', 404);

        const inputCurrentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        if (inputCurrentHash !== currentHashDb) {
            throw new AppError('Mật khẩu hiện tại không đúng', 400);
        }

        const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
        await StaffDAO.resetPassword(userId, newHash);
        
        return { message: 'Đổi mật khẩu thành công' };
    }
}

module.exports = StaffModule;
