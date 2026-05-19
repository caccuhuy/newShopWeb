const OrderDAO = require('../dao/OrderDAO');
const AppError = require('../utils/AppError');

class OrderModule {
    // 1. Lấy toàn bộ đơn hàng (Cho Admin/Staff)
    static async getAllOrders() {
        const rawOrders = await OrderDAO.getAllOrders();
        
        // Định dạng lại dữ liệu trả về cho Frontend
        return rawOrders.map(order => ({
            id: order.order_id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            customer_info: {
                name: order.customer_name || 'Khách vãng lai',
                phone: order.customer_phone || 'N/A'
            },
            item_count: order.item_count
        }));
    }

    // 2. Lấy danh sách lịch sử mua hàng cá nhân
    static async getCustomerOrders(userId) {
        if (!userId) throw new AppError('Người dùng không hợp lệ', 401);
        
        const rawOrders = await OrderDAO.getCustomerOrders(userId);
        
        return rawOrders.map(order => ({
            id: order.order_id,
            total_amount: order.total_amount,
            status: order.status,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            item_count: order.item_count
        }));
    }

    // 3. Lấy chi tiết đơn hàng cá nhân
    static async getCustomerOrderDetail(orderId, userId) {
        if (!orderId) throw new AppError('Mã đơn hàng bị thiếu', 400);
        return await OrderDAO.getOrderDetail(orderId, userId);
    }

    // 4. Lấy chi tiết đơn hàng cho Nhân viên (không giới hạn userId)
    static async getOrderDetailForStaff(orderId) {
        if (!orderId) throw new AppError('Mã đơn hàng bị thiếu', 400);
        return await OrderDAO.getOrderDetail(orderId, null);
    }

    // 5. Kiểm tra Tồn Kho
    static async checkStock(orderId) {
        if (!orderId) throw new AppError('Mã đơn hàng bị thiếu', 400);
        return await OrderDAO.getAvailableSerialsForOrder(orderId);
    }

    // 6. Xử lý Xuất Kho
    static async exportOrder(orderId, staffId, serials) {
        if (!orderId || !staffId) throw new AppError('Dữ liệu không đầy đủ', 400);
        if (!serials || !Array.isArray(serials)) {
            throw new AppError('Danh sách Serial không hợp lệ', 400);
        }

        const docId = await OrderDAO.createExportDocFromOrder(orderId, staffId, serials);
        return { message: 'Đã xác nhận đơn hàng và tạo phiếu xuất kho nháp', docId };
    }

    // 7. Cập nhật Trạng thái đơn hàng
    static async updateOrderStatus(orderId, status) {
        if (!orderId || !status) throw new AppError('Dữ liệu không hợp lệ', 400);
        
        const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            throw new AppError('Trạng thái không hợp lệ', 400);
        }

        await OrderDAO.updateOrderStatus(orderId, status.toLowerCase());
        return { message: 'Cập nhật trạng thái thành công' };
    }

    // 8. Đặt hàng mới (Customer)
    static async createCustomerOrder(userId, items, totalAmount, shippingAddress, customerInfo = null) {
        if (!userId) throw new AppError('Người dùng không hợp lệ', 401);
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError('Giỏ hàng không được để trống', 400);
        }

        const CustomerDAO = require('../dao/CustomerDAO');
        const profile = await CustomerDAO.getProfile(userId);
        if (!profile) {
            throw new AppError('Không tìm thấy thông tin tài khoản khách hàng', 404);
        }

        // Lấy thông tin từ request body
        const requestPhone = customerInfo?.phone || customerInfo?.phone_number;
        const requestAddress = shippingAddress || customerInfo?.address;

        // Ưu tiên dùng thông tin từ tài khoản nếu có, nếu chưa có thì lấy từ checkout
        let finalAddress = profile.default_address || requestAddress;
        let finalPhone = profile.phone_number || requestPhone;

        // Nếu người dùng cung cấp thông tin mới tại checkout khác với thông tin mặc định,
        // chúng ta cập nhật lại tài khoản với thông tin mới nhất
        if (requestAddress && requestAddress !== profile.default_address) {
            finalAddress = requestAddress;
        }
        if (requestPhone && requestPhone !== profile.phone_number) {
            finalPhone = requestPhone;
        }

        if (!finalAddress) {
            throw new AppError('Địa chỉ giao hàng không được để trống', 400);
        }
        if (!finalPhone) {
            throw new AppError('Số điện thoại không được để trống', 400);
        }

        // Nếu có cập nhật/thay đổi thông tin, lưu lại vào hồ sơ khách hàng để đồng bộ
        if (finalAddress !== profile.default_address || finalPhone !== profile.phone_number) {
            await CustomerDAO.updateProfile(
                userId,
                profile.username || 'Khách hàng',
                finalPhone,
                finalAddress
            );
        }

        const orderId = `ORD-${Date.now().toString().slice(-9)}`;
        
        await OrderDAO.createCustomerOrder(orderId, userId, totalAmount, finalAddress, items);
        
        // Trả về orderId vừa tạo
        return { message: 'Đơn hàng đã được tạo', order_id: orderId };
    }
}

module.exports = OrderModule;
