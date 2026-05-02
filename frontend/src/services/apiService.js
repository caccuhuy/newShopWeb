const BASE_URL = 'http://localhost:5000/api';

// Helper for auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const apiService = {
    // Auth
    login: async (email, password, isStaff = false) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Lỗi đăng nhập');
        
        const userRole = data.user.role;
        if (isStaff && userRole === 'Customer') throw new Error('Tài khoản không có quyền truy cập');
        if (!isStaff && userRole !== 'Customer') throw new Error('Vui lòng dùng trang quản trị');

        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Lỗi đăng ký');
        return data;
    },

    // Products (Real API)
    getProducts: async () => {
        const response = await fetch(`${BASE_URL}/products`);
        if (!response.ok) throw new Error('Lỗi lấy danh sách sản phẩm');
        return await response.json();
    },

    getProductById: async (id) => {
        const response = await fetch(`${BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Sản phẩm không tồn tại');
        return await response.json();
    },

    addProduct: async (formData) => {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { ...getAuthHeaders() }, // Don't set Content-Type, browser will do it for FormData
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi thêm sản phẩm');
        return data;
    },

    updateProduct: async (id, formData) => {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders() },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi cập nhật sản phẩm');
        return data;
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi xóa sản phẩm');
        return data;
    },

    // Categories
    getCategories: async () => {
        const response = await fetch(`${BASE_URL}/categories`);
        if (!response.ok) throw new Error('Lỗi lấy danh mục');
        return await response.json();
    },

    addCategory: async (catName) => {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ cat_name: catName })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi thêm danh mục');
        return data;
    },

    updateCategory: async (id, catName) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ cat_name: catName })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi cập nhật danh mục');
        return data;
    },

    deleteCategory: async (id) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi xóa danh mục');
        return data;
    },

    // Suppliers
    getSuppliers: async () => {
        const response = await fetch(`${BASE_URL}/suppliers`);
        if (!response.ok) throw new Error('Lỗi lấy nhà cung cấp');
        return await response.json();
    },

    addSupplier: async (tax_id, supplier_name) => {
        const response = await fetch(`${BASE_URL}/suppliers`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tax_id, supplier_name })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi thêm nhà cung cấp');
        return data;
    },

    updateSupplier: async (tax_id, supplier_name) => {
        const response = await fetch(`${BASE_URL}/suppliers/${tax_id}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ supplier_name })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi cập nhật nhà cung cấp');
        return data;
    },

    deleteSupplier: async (tax_id) => {
        const response = await fetch(`${BASE_URL}/suppliers/${tax_id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi xóa nhà cung cấp');
        return data;
    },

    // Staff Management (Admin only)
    getStaffList: async () => {
        const response = await fetch(`${BASE_URL}/staff`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi lấy danh sách nhân viên');
        return data;
    },

    getDashboardStats: async (days = 30) => {
        const response = await fetch(`${BASE_URL}/analytics/dashboard?days=${days}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi lấy dữ liệu thống kê');
        return data;
    },

    createStaff: async (staffData) => {
        const response = await fetch(`${BASE_URL}/staff`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(staffData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi thêm nhân viên');
        return data;
    },

    updateStaffStatus: async (userId, isActive) => {
        const response = await fetch(`${BASE_URL}/staff/${userId}/status`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: isActive })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái');
        return data;
    },

    resetStaffPassword: async (userId, newPassword) => {
        const response = await fetch(`${BASE_URL}/staff/${userId}/reset-password`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi reset mật khẩu');
        return data;
    },

    // Orders
    getOrders: async () => {
        const response = await fetch(`${BASE_URL}/orders`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Lỗi lấy danh sách đơn hàng');
        return await response.json();
    },

    getOrderById: async (id) => {
        const response = await fetch(`${BASE_URL}/orders/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Không tìm thấy đơn hàng');
        return await response.json();
    },

    checkOrderStock: async (id) => {
        const response = await fetch(`${BASE_URL}/orders/${id}/check-stock`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Lỗi kiểm tra tồn kho');
        return await response.json();
    },

    processOrderExport: async (id, serials) => {
        const response = await fetch(`${BASE_URL}/orders/${id}/export`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ serials })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi xuất kho');
        return data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
        return data;
    },

    // Activity Log
    addActivityLog: async (logData) => {
        // Mock activity log for now or implement if backend route exists
        console.log('Activity Log:', logData);
        return { success: true };
    }
};
