const LogDAO = require('../dao/LogDAO');
const AppError = require('../utils/AppError');

class LogModule {
    static async getAll() {
        return await LogDAO.getAll();
    }

    static async create(userId, action, type) {
        if (!userId) throw new AppError('Mã người dùng không hợp lệ', 400);
        if (!action) throw new AppError('Hành động ghi log không được để trống', 400);
        
        await LogDAO.create(userId, action, type);
        return { message: 'Log added successfully' };
    }
}

module.exports = LogModule;
