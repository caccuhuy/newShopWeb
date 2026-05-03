// api.js - Senior Standard (Mock Auth System)

// Tự động làm mới Database người dùng nếu là phiên bản cũ
const NEW_DEFAULT_USERS = [
    { email: 'admin@shop.com', password: 'password123', name: 'Quản Trị Viên', role: 'admin' },
    { email: 'staff@shop.com', password: 'staff123', name: 'Nhân Viên Bán Hàng', role: 'staff' },
    { email: 'user@gmail.com', password: 'user123', name: 'Nguyễn Khách Hàng', role: 'customer' }
];

const existingUsers = JSON.parse(localStorage.getItem('mock_users'));
if (!existingUsers || !existingUsers.find(u => u.email === 'user@gmail.com')) {
    localStorage.setItem('mock_users', JSON.stringify(NEW_DEFAULT_USERS));
}

// Tự động làm mới Database sản phẩm nếu chưa có trong localStorage
if (!localStorage.getItem('mock_products')) {
    const productsWithStock = MOCK_PRODUCTS.map(p => ({ ...p, stock_quantity: 20 }));
    localStorage.setItem('mock_products', JSON.stringify(productsWithStock));
}

async function fetchData(endpoint, options = {}) {
    console.log(`[API Request] ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const users = JSON.parse(localStorage.getItem('mock_users'));
    const products = JSON.parse(localStorage.getItem('mock_products'));

    // 1. Logic Đăng ký
    if (endpoint === '/auth/register') {
        const newUser = JSON.parse(options.body);
        if (newUser.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự!');
        if (users.find(u => u.email === newUser.email)) throw new Error('Email này đã được đăng ký!');

        users.push({ ...newUser, role: 'customer' });
        localStorage.setItem('mock_users', JSON.stringify(users));
        return { message: 'Đăng ký thành công!' };
    }

    // 2. Logic Đăng nhập Khách hàng
    if (endpoint === '/auth/login') {
        const { email, password } = JSON.parse(options.body);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) throw new Error('Email hoặc mật khẩu không chính xác!');
        if (user.role !== 'customer') throw new Error('Tài khoản này không có quyền truy cập khu vực khách hàng!');

        return { 
            token: 'mock-jwt-customer-' + Math.random(), 
            user: { name: user.name, email: user.email, role: user.role } 
        };
    }

    // 2.1. Logic Đăng nhập Nhân viên
    if (endpoint === '/auth/staff-login') {
        const { email, password } = JSON.parse(options.body);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) throw new Error('Email hoặc mật khẩu không chính xác!');
        if (user.role !== 'staff' && user.role !== 'admin') throw new Error('Bạn không có quyền truy cập vào Portal Nhân Viên!');

        return { 
            token: 'mock-jwt-staff-' + Math.random(), 
            user: { name: user.name, email: user.email, role: user.role } 
        };
    }

    // 3. Lấy sản phẩm
    if (endpoint === '/products') return products;
    
    if (endpoint.startsWith('/products/')) {
        const parts = endpoint.split('/');
        
        // Logic cập nhật kho hàng: /products/update-stock
        if (parts[2] === 'update-stock') {
            const { productId, type, quantity } = JSON.parse(options.body);
            const productIndex = products.findIndex(p => p.id === productId);
            
            if (productIndex === -1) throw new Error('Sản phẩm không tồn tại');
            
            if (type === 'import') {
                products[productIndex].stock_quantity += quantity;
            } else if (type === 'export') {
                if (products[productIndex].stock_quantity < quantity) throw new Error('Số lượng tồn kho không đủ để xuất!');
                products[productIndex].stock_quantity -= quantity;
            }
            
            localStorage.setItem('mock_products', JSON.stringify(products));
            return { message: 'Cập nhật kho thành công!', newStock: products[productIndex].stock_quantity };
        }

        // Logic thêm sản phẩm mới
        if (parts[2] === 'add') {
            const newProduct = JSON.parse(options.body);
            newProduct.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            newProduct.stock_quantity = newProduct.stock_quantity || 0;
            
            products.push(newProduct);
            localStorage.setItem('mock_products', JSON.stringify(products));
            return { message: 'Thêm sản phẩm thành công!', product: newProduct };
        }

        const id = parseInt(parts.pop());
        const product = products.find(p => p.id === id);
        if (product) return product;
        throw new Error('Sản phẩm không tồn tại');
    }

    if (endpoint === '/orders') return { message: 'Success', orderId: Date.now() };

    throw new Error('Endpoint không hợp lệ');
}
