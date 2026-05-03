document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    try {
        const products = await fetchData('/products');
        productGrid.innerHTML = products.map(p => `
            <div class="product-card group bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all cursor-pointer" onclick="window.location.href='productDetail.html?id=${p.id}'">
                <div class="relative bg-gray-50 rounded-xl overflow-hidden aspect-square mb-5">
                    <img src="${p.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="${p.name}">
                </div>
                <div class="space-y-2">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.brand}</span>
                    <h3 class="font-bold text-gray-900 group-hover:text-[#3451B2] transition-colors">${p.name}</h3>
                    <div class="flex items-center justify-between pt-4">
                        <span class="text-lg font-extrabold text-[#3451B2]">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                        <button class="cart-btn p-3 bg-[#3451B2] text-white rounded-xl shadow-lg shadow-blue-100 active:scale-90" 
                                onclick="event.stopPropagation(); window.handleAddToCart(${p.id})">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Global function to handle add to cart from HTML string
        window.handleAddToCart = (productId) => {
            const product = products.find(p => p.id === productId);
            if (product) {
                CartManager.addToCart(product);
            }
        };

    } catch (err) {
        console.error('Error loading products:', err);
    }
});
