const CartManager = {
    getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (e) { return []; }
    },

    addToCart(product, quantity = 1) {
        let cart = this.getCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.syncUI();
        this.showToast(`Đã thêm ${product.name} vào giỏ hàng!`);
    },

    updateQuantity(productId, delta) {
        let cart = this.getCart();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            this.syncUI();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    },

    clearCart() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?')) {
            localStorage.removeItem('cart');
            this.syncUI();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    },

    // MỚI: Cập nhật thông tin người dùng lên Header
    syncUserUI() {
        const userData = JSON.parse(localStorage.getItem('customerUser'));
        const navContainer = document.querySelector('nav');
        if (!navContainer) return;

        // Tìm nút Login cũ (thường là thẻ có chữ 'Login')
        const loginLinks = Array.from(navContainer.querySelectorAll('a, span')).filter(el => el.textContent.trim().toLowerCase() === 'login');
        
        if (userData && userData.name) {
            loginLinks.forEach(link => {
                // Thay thế nút Login bằng Tên User và nút Đăng xuất
                const parent = link.parentElement;
                if (parent && parent.classList.contains('group')) {
                    // Nếu là icon group trong index.html
                    parent.innerHTML = `
                        <span class="font-bold text-[#3451B2]">Hi, ${userData.name}</span>
                        <button onclick="CartManager.logout()" class="ml-4 text-xs text-red-500 hover:underline">Logout</button>
                    `;
                } else {
                    // Nếu là link bình thường trong dashboard.html
                    link.outerHTML = `
                        <div class="flex items-center space-x-4">
                            <span class="text-[#3451B2] font-bold">Hi, ${userData.name}</span>
                            <button onclick="CartManager.logout()" class="text-[10px] uppercase font-black text-gray-400 hover:text-red-500 transition-colors">Logout</button>
                        </div>
                    `;
                }
            });
        }
    },

    logout() {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        window.location.href = window.location.pathname.includes('/pages/') ? 'customerLogin.html' : 'pages/customerLogin.html';
    },

    syncUI() {
        const cart = this.getCart();
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        });
        document.querySelectorAll('.cart-icon-btn').forEach(icon => {
            icon.onclick = (e) => { 
                e.preventDefault(); 
                window.location.href = window.location.pathname.includes('/pages/') ? 'checkOut.html' : 'pages/checkOut.html'; 
            };
        });
        
        // Gọi thêm hàm cập nhật User
        this.syncUserUI();
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#3451B2; color:white; padding:12px 24px; border-radius:12px; z-index:9999; box-shadow:0 10px 20px rgba(0,0,0,0.2); font-weight:bold; transition:all 0.3s ease;";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => CartManager.syncUI());
