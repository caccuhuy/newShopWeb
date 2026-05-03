document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartItemsList');
    const totalDisplay = document.getElementById('finalTotal');
    const checkoutBtn = document.getElementById('confirmCheckout');

    const renderCart = () => {
        const cart = CartManager.getCart();
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-gray-400 mb-4 text-sm">Giỏ hàng đang trống</p>
                    <a href="dashboard.html" class="text-[#3451B2] font-bold text-xs underline">Quay lại mua sắm</a>
                </div>
            `;
            totalDisplay.textContent = '0đ';
            if(checkoutBtn) checkoutBtn.disabled = true;
            return 0;
        }

        if(checkoutBtn) checkoutBtn.disabled = false;

        let total = 0;
        cartContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="flex items-center space-x-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group">
                    <img src="${item.image_url}" class="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform">
                    <div class="flex-1">
                        <h3 class="text-xs font-bold text-gray-800 line-clamp-1">${item.name}</h3>
                        <p class="text-[10px] font-black text-[#3451B2] mt-1">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                        
                        <div class="flex items-center space-x-3 mt-3">
                            <button onclick="window.handleUpdateQty(${item.id}, -1)" class="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-[#3451B2] hover:text-white transition-all shadow-sm">-</button>
                            <span class="text-xs font-black w-4 text-center text-gray-700">${item.quantity}</span>
                            <button onclick="window.handleUpdateQty(${item.id}, 1)" class="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-[#3451B2] hover:text-white transition-all shadow-sm">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black text-gray-900">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal)}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        totalDisplay.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
        return total;
    };

    // Global function for onclick in strings
    window.handleUpdateQty = (id, delta) => CartManager.updateQuantity(id, delta);

    // Initial load
    let currentTotal = renderCart();

    // Listen for updates
    window.addEventListener('cartUpdated', () => {
        currentTotal = renderCart();
    });

    // Handle Checkout Action
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            const name = document.getElementById('custName').value;
            const phone = document.getElementById('custPhone').value;
            const address = document.getElementById('custAddress').value;
            const cart = CartManager.getCart();

            if (!name || !phone || !address) {
                alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
                return;
            }

            try {
                checkoutBtn.innerText = "ĐANG XỬ LÝ...";
                checkoutBtn.disabled = true;
                
                await fetchData('/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, address, total: currentTotal, items: cart })
                });

                alert('ĐẶT HÀNG THÀNH CÔNG! Đơn hàng của bạn đang được xử lý.');
                localStorage.removeItem('cart');
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert('Lỗi: ' + err.message);
                checkoutBtn.innerText = "XÁC NHẬN THANH TOÁN";
                checkoutBtn.disabled = false;
            }
        };
    }
});
