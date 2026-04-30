import { MOCK_PRODUCTS } from '../data/products';

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
        await new Promise(r => setTimeout(r, 500));
        const users = getLocalData('mock_users', DEFAULT_USERS);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) throw new Error('Email hoặc mật khẩu không chính xác!');
        
        if (isStaff && user.role === 'customer') {
            throw new Error('Bạn không có quyền truy cập vào Portal Nhân Viên!');
        }
        if (!isStaff && user.role !== 'customer') {
             throw new Error('Tài khoản này không có quyền truy cập khu vực khách hàng!');
        }

        return { 
            token: 'mock-jwt-' + (isStaff ? 'staff-' : 'customer-') + Math.random(), 
            user: { name: user.name, email: user.email, role: user.role } 
        };
    },

    register: async (userData) => {
        await new Promise(r => setTimeout(r, 500));
        const users = getLocalData('mock_users', DEFAULT_USERS);
        if (users.find(u => u.email === userData.email)) throw new Error('Email này đã được đăng ký!');
        
        const newUser = { ...userData, role: 'customer' };
        users.push(newUser);
        saveLocalData('mock_users', users);
        return { message: 'Đăng ký thành công!' };
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

    // Users Management (Admin only)
    getUsers: async () => {
        await new Promise(r => setTimeout(r, 300));
        return getLocalData('mock_users', DEFAULT_USERS);
    },

    deleteUser: async (email) => {
        await new Promise(r => setTimeout(r, 500));
        let users = getLocalData('mock_users', DEFAULT_USERS);
        users = users.filter(u => u.email !== email);
        saveLocalData('mock_users', users);
        return { message: 'Xóa thành công' };
    },

    updateUser: async (email, updateData) => {
        await new Promise(r => setTimeout(r, 500));
        const users = getLocalData('mock_users', DEFAULT_USERS);
        const index = users.findIndex(u => u.email === email);
        if (index === -1) throw new Error('Người dùng không tồn tại');
        
        users[index] = { ...users[index], ...updateData };
        saveLocalData('mock_users', users);
        return users[index];
    },

    // Orders Management
    getOrders: async () => {
        await new Promise(r => setTimeout(r, 400));
        return getLocalData('mock_orders', []);
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
