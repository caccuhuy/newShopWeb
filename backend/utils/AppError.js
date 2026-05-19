class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Để phân biệt với các lỗi bug lập trình chưa bắt được
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
