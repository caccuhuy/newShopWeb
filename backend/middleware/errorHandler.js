const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log chi tiết lỗi để debug ở console
    console.error(`[ERROR] ${err.statusCode} - ${err.message}`);

    if (err.isOperational) {
        // Lỗi do chúng ta chủ động quăng ra (AppError)
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Lỗi do hệ thống hoặc thư viện (Bug, Database rớt...)
        return res.status(500).json({
            status: 'error',
            message: err.message, stack: err.stack
        });
    }
};

module.exports = errorHandler;
