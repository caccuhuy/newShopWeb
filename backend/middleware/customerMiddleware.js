const isCustomer = (req, res, next) => {
    if (req.user && req.user.role === 'Customer') {
        return next();
    }

    return res.status(403).json({
        message: 'Bạn cần đăng nhập bằng tài khoản khách hàng để truy cập chức năng này'
    });
};

module.exports = { isCustomer };