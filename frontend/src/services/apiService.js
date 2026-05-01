import { MOCK_PRODUCTS } from '../mocks/products';

// Helper to get from localStorage or default
const getLocalData = (key, defaultData) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
};

const saveLocalData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize data if not exists
if (!localStorage.getItem('mock_products')) {
    const productsWithStock = MOCK_PRODUCTS.map(p => ({ ...p, stock_quantity: 20 }));
    saveLocalData('mock_products', productsWithStock);
}

const DEFAULT_USERS = [
    { email: 'admin@shop.com', password: 'password123', name: 'Quản Trị Viên', role: 'admin' },
    { email: 'staff@shop.com', password: 'staff123', name: 'Nhân Viên Bán Hàng', role: 'staff' },
    { email: 'user@gmail.com', password: 'user123', name: 'Nguyễn Khách Hàng', role: 'customer' }
];

if (!localStorage.getItem('mock_users')) {
    saveLocalData('mock_users', DEFAULT_USERS);
}

export const apiService = {
    // Auth
    login: async (email, password, isStaff = false) => {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Lỗi đăng nhập');
        }
        
        const userRole = data.user.role;
        if (isStaff && userRole === 'Customer') {
            throw new Error('Tài khoản sai mật khẩu hoặc không tồn tại');
        }
        if (!isStaff && userRole !== 'Customer') {
            throw new Error('Tài khoản sai mật khẩu hoặc không tồn tại');
        }

        return data;
    },

    register: async (userData) => {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Lỗi đăng ký');
        }
        
        return data;
    },

    // Products
    getProducts: async () => {
        await new Promise(r => setTimeout(r, 300));
        return getLocalData('mock_products', []);
    },

    getProductById: async (id) => {
        await new Promise(r => setTimeout(r, 300));
        const products = getLocalData('mock_products', []);
        const product = products.find(p => p.id === parseInt(id));
        if (!product) throw new Error('Sản phẩm không tồn tại');
        return product;
    },

    addProduct: async (productData) => {
        await new Promise(r => setTimeout(r, 500));
        const products = getLocalData('mock_products', []);
        const newProduct = {
            ...productData,
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            stock_quantity: productData.stock_quantity || 0
        };
        products.push(newProduct);
        saveLocalData('mock_products', products);
        return newProduct;
    },

    updateStock: async (productId, type, quantity) => {
        await new Promise(r => setTimeout(r, 500));
        const products = getLocalData('mock_products', []);
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error('Sản phẩm không tồn tại');
        
        if (type === 'import') {
            products[index].stock_quantity += quantity;
        } else if (type === 'export') {
            if (products[index].stock_quantity < quantity) throw new Error('Số lượng tồn kho không đủ!');
            products[index].stock_quantity -= quantity;
        }
        
        saveLocalData('mock_products', products);
        return products[index].stock_quantity;
    },

    // Helper for auth headers
    getAuthHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    // Users Management (Admin only)
    getStaffList: async () => {
        const response = await fetch('http://localhost:5000/api/staff', {
            headers: apiService.getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi lấy danh sách nhân viên');
        return data;
    },

    getDashboardStats: async (days = 30) => {
        const response = await fetch(`http://localhost:5000/api/analytics/dashboard?days=${days}`, {
            headers: apiService.getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi lấy dữ liệu thống kê');
        return data;
    },

    createStaff: async (staffData) => {
        const response = await fetch('http://localhost:5000/api/staff', {
            method: 'POST',
            headers: apiService.getAuthHeaders(),
            body: JSON.stringify(staffData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi thêm nhân viên');
        return data;
    },

    updateStaffStatus: async (userId, isActive) => {
        const response = await fetch(`http://localhost:5000/api/staff/${userId}/status`, {
            method: 'PUT',
            headers: apiService.getAuthHeaders(),
            body: JSON.stringify({ is_active: isActive })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái');
        return data;
    },

    resetStaffPassword: async (userId, newPassword) => {
        const response = await fetch(`http://localhost:5000/api/staff/${userId}/reset-password`, {
            method: 'PUT',
            headers: apiService.getAuthHeaders(),
            body: JSON.stringify({ password: newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi reset mật khẩu');
        return data;
    },

    // Orders Management
    getOrders: async () => {
        await new Promise(r => setTimeout(r, 400));
        return getLocalData('mock_orders', []);
    },

    createOrder: async (orderData) => {
        await new Promise(r => setTimeout(r, 500));
        const orders = getLocalData('mock_orders', []);
        const newOrder = {
            ...orderData,
            id: Date.now(),
            status: 'pending'
        };
        orders.push(newOrder);
        saveLocalData('mock_orders', orders);
        return newOrder;
    },

    updateOrderStatus: async (orderId, status) => {
        await new Promise(r => setTimeout(r, 500));
        const orders = getLocalData('mock_orders', []);
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) throw new Error('Đơn hàng không tồn tại');
        
        orders[index].status = status;
        saveLocalData('mock_orders', orders);
        return orders[index];
    },

    // Activity Logs
    addActivityLog: async (logData) => {
        const logs = getLocalData('mock_logs', []);
        const newLog = { ...logData, id: Date.now(), timestamp: new Date() };
        logs.push(newLog);
        saveLocalData('mock_logs', logs);
        return newLog;
    },

    getActivityLogs: async () => {
        await new Promise(r => setTimeout(r, 300));
        return getLocalData('mock_logs', []);
    }
};
