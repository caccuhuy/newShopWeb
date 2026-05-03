document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) {
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const product = await fetchData(`/products/${productId}`);
        
        // Update UI Elements
        document.title = `${product.name} | ArchitectLedger`;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('brandLabel').textContent = product.brand;
        document.getElementById('productPrice').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
        document.getElementById('mainImage').src = product.image_url;
        
        // Update Specs Table
        const specsContainer = document.getElementById('specsTable');
        if (specsContainer && product.specs) {
            specsContainer.innerHTML = `
                <tr class="border-b border-gray-50"><td class="p-5 font-bold text-gray-400 w-1/3 bg-gray-50/50 uppercase text-[10px]">Hệ điều hành</td><td class="p-5 text-gray-800">${product.specs.OS}</td></tr>
                <tr class="border-b border-gray-50"><td class="p-5 font-bold text-gray-400 bg-gray-50/50 uppercase text-[10px]">RAM</td><td class="p-5 text-gray-800">${product.specs.RAM}</td></tr>
                <tr class="border-b border-gray-50"><td class="p-5 font-bold text-gray-400 bg-gray-50/50 uppercase text-[10px]">Bộ nhớ</td><td class="p-5 text-gray-800">${product.specs.Storage}</td></tr>
                <tr class="border-b border-gray-50"><td class="p-5 font-bold text-gray-400 bg-gray-50/50 uppercase text-[10px]">Dung lượng Pin</td><td class="p-5 text-gray-800">${product.specs.Battery}</td></tr>
            `;
        }

        // Add to cart logic
        const addBtn = document.getElementById('addCartBtn');
        if (addBtn) {
            addBtn.onclick = () => {
                const qty = parseInt(document.getElementById('qty').value);
                CartManager.addToCart(product, qty);
            };
        }

    } catch (err) {
        console.error('Error:', err);
        alert('Sản phẩm không tồn tại trong danh mục!');
        window.location.href = 'dashboard.html';
    }
});
