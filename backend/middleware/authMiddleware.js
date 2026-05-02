const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token không tồn tại' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    console.log('Checking Admin permission for user:', req.user?.id, 'Role:', req.user?.role);
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        console.warn('Access denied: User is not Admin');
        res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này (Yêu cầu Admin)' });
    }
};

const isStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'Staff' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này (Yêu cầu Staff/Admin)' });
    }
};

module.exports = { verifyToken, isAdmin, isStaff };
