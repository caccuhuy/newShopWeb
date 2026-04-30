document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra đăng nhập
    const staffToken = localStorage.getItem('staffToken');
    const staffUser = JSON.parse(localStorage.getItem('staffUser'));

    if (!staffToken || !staffUser) {
        window.location.href = 'staffLogin.html';
        return;
    }

    // 2. Cập nhật thông tin nhân viên
    const staffNameElem = document.querySelector('.text-xs.font-bold.text-gray-700');
    if (staffNameElem) staffNameElem.textContent = staffUser.name;

    // 3. Xử lý Kho hàng
    const tableBody = document.getElementById('inventoryTableBody');
    const searchInput = document.getElementById('inventorySearch');

    async function loadInventory() {
        try {
            const products = await fetchData('/products');
            renderTable(products);
        } catch (err) {
            console.error('Lỗi tải kho:', err);
        }
    }

    function renderTable(products) {
        const searchTerm = (searchInput.value || '').toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

        tableBody.innerHTML = filtered.map(p => `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-6">
                    <div class="flex items-center space-x-4">
                        <img src="${p.image_url}" class="w-10 h-10 rounded-lg object-cover border border-gray-100">
                        <div>
                            <p class="font-bold text-gray-900">${p.name}</p>
                            <p class="text-[10px] text-gray-400 uppercase font-black">${p.brand}</p>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-6 text-center">
                    <span class="px-3 py-1 ${p.stock_quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#3451B2]'} rounded-full text-xs font-black">
                        ${p.stock_quantity}
                    </span>
                </td>
                <td class="px-8 py-6 text-right pr-12">
                    <div class="flex justify-end space-x-2">
                        <button onclick="handleStockUpdate(${p.id}, 'import')" class="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-lg hover:bg-green-600 transition-all uppercase">Nhập</button>
                        <button onclick="handleStockUpdate(${p.id}, 'export')" class="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-lg hover:bg-orange-600 transition-all uppercase">Xuất</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Xử lý cập nhật kho
    window.handleStockUpdate = async (productId, type) => {
        const action = type === 'import' ? 'NHẬP THÊM' : 'XUẤT KHO';
        const quantity = prompt(`Nhập số lượng muốn ${action}:`, "10");
        
        if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) return;

        try {
            await fetchData('/products/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, type, quantity: parseInt(quantity) })
            });
            alert(`${action} thành công!`);
            loadInventory();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    // 4. Tính năng Xuất báo cáo (CSV)
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
        btnExportReport.onclick = async () => {
            const products = await fetchData('/products');
            let csvContent = "ID,Ten San Pham,Hang,Gia,Ton Kho\n";
            
            products.forEach(p => {
                csvContent += `${p.id},"${p.name}",${p.brand},${p.price},${p.stock_quantity}\n`;
            });

            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Bao_cao_kho_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    // 5. Tính năng Tạo phiếu mới (Thêm sản phẩm)
    const btnCreateTicket = document.getElementById('btnCreateTicket');
    if (btnCreateTicket) {
        btnCreateTicket.onclick = async () => {
            const name = prompt("Nhập tên sản phẩm mới:");
            if (!name) return;
            const brand = prompt("Nhập hãng sản xuất:");
            const price = prompt("Nhập giá bán (VND):");
            const stock = prompt("Nhập số lượng nhập kho ban đầu:", "20");
            const imageUrl = prompt("Nhập URL hình ảnh sản phẩm:", "https://via.placeholder.com/150");

            if (!name || !brand || isNaN(price)) {
                alert("Thông tin không hợp lệ!");
                return;
            }

            try {
                await fetchData('/products/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        brand,
                        price: parseInt(price),
                        stock_quantity: parseInt(stock),
                        image_url: imageUrl,
                        specs: { OS: "N/A", RAM: "N/A", Storage: "N/A", Battery: "N/A" }
                    })
                });
                alert("Đã tạo phiếu nhập hàng và thêm sản phẩm mới thành công!");
                loadInventory();
            } catch (err) {
                alert("Lỗi: " + err.message);
            }
        };
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => loadInventory());
    }
    
    // Khởi tạo
    loadInventory();

    // 6. Xử lý Đăng xuất
    const logoutBtn = document.querySelector('button.w-full.text-left.px-4.py-2.text-xs.text-gray-400');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('staffToken');
            localStorage.removeItem('staffUser');
            window.location.href = 'staffLogin.html';
        };
    }
});
