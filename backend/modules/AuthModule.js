const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AuthDAO = require('../dao/AuthDAO');
const AppError = require('../utils/AppError');

class AuthModule {
    static async login(email, password) {
        if (!email || !password) {
            throw new AppError('Vui lòng cung cấp email và mật khẩu', 400);
        }

        const user = await AuthDAO.loginUser(email);
        if (!user) {
            throw new AppError('Tài khoản sai mật khẩu hoặc không tồn tại', 401);
        }

        // Hash mật khẩu đầu vào bằng SHA-256
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        // So sánh
        if (hash.toLowerCase() !== user.pasword_hash.toLowerCase()) {
            throw new AppError('Tài khoản sai mật khẩu hoặc không tồn tại', 401);
        }

        // Kiểm tra hoạt động
        if (user.is_active === false) {
            throw new AppError('Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ Quản trị viên', 403);
        }

        // Sinh JWT token
        const payload = { 
            id: user.user_id, 
            role: user.role_name 
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '8h' });

        return {
            token,
            user: {
                id: user.user_id,
                name: user.username,
                role: user.role_name,
                email: user.email
            }
        };
    }

    static async register(name, email, password, phone, address) {
        if (!name || !email || !password || !phone || !address) {
            throw new AppError('Vui lòng điền đầy đủ thông tin (Họ tên, Email, Mật khẩu, Số điện thoại, Địa chỉ)', 400);
        }

        const hash = crypto.createHash('sha256').update(password).digest('hex');

        const result = await AuthDAO.registerCustomer(name, email, phone, address, hash);
        if (!result || !result.newUserId) {
            throw new AppError('Đăng ký không thành công', 400);
        }

        return {
            newUserId: result.newUserId,
            message: 'Đăng ký thành công'
        };
    }
}

module.exports = AuthModule;
