import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Modal from '../../components/Modal/Modal';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { Download, Plus, Search, Bell } from 'lucide-react';
import styles from './AdminPage.module.css';

const AdminPage = () => {
    const { isStaff, isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', price: '', stock_quantity: 20, image_url: 'https://via.placeholder.com/150'
    });

    useEffect(() => {
        if (!isStaff) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [isStaff, navigate]);

    const fetchProducts = async () => {
        try {
            const data = await apiService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (id, type) => {
        const action = type === 'import' ? 'NHẬP THÊM' : 'XUẤT KHO';
        const quantity = prompt(`Nhập số lượng muốn ${action}:`, "10");
        
        if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) return;

        try {
            const newStock = await apiService.updateStock(id, type, parseInt(quantity));
            setProducts(products.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p));
            alert(`${action} thành công!`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await apiService.addProduct({
                ...newProduct,
                price: parseInt(newProduct.price),
                stock_quantity: parseInt(newProduct.stock_quantity),
                specs: { OS: "N/A", RAM: "N/A", Storage: "N/A", Battery: "N/A" }
            });
            setShowModal(false);
            fetchProducts();
            alert('Đã tạo phiếu nhập hàng và thêm sản phẩm mới thành công!');
        } catch (error) {
            alert(error.message);
        }
    };

    const exportCSV = () => {
        let csvContent = "ID,Ten San Pham,Hang,Gia,Ton Kho\n";
        products.forEach(p => {
            csvContent += `${p.id},"${p.name}",${p.brand},${p.price},${p.stock_quantity}\n`;
        });
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao_cao_kho_${new Date().toLocaleDateString()}.csv`);
        link.click();
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isStaff) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Trang Dashboard Nhân Viên</h2>
                        <p className={styles.subtitle}>Chào mừng trở lại. Đây là cái nhìn tổng quan về hoạt động hôm nay.</p>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.btnExport} onClick={exportCSV}>Xuất báo cáo</button>
                        {/* CHỈ ADMIN MỚI THẤY NÚT TẠO PHIẾU MỚI */}
                        {isAdmin && (
                            <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>Tạo phiếu mới</button>
                        )}
                    </div>
                </header>

                {/* Grid Phím tắt */}
                <div className={styles.quickStats}>
                    <div className={styles.quickCard}>
                        <div className={`${styles.iconCircle} bg-blue-50 text-[#3451B2]`}>🏢</div>
                        <p className={styles.quickLabel}>Nhà cung cấp</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={`${styles.iconCircle} bg-purple-50 text-purple-600`}>📄</div>
                        <p className={styles.quickLabel}>Các loại phiếu</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={`${styles.iconCircle} bg-green-50 text-green-600`}>🏠</div>
                        <p className={styles.quickLabel}>Tình trạng kho</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={`${styles.iconCircle} bg-orange-50 text-orange-600`}>📈</div>
                        <p className={styles.quickLabel}>Báo cáo thống kê</p>
                    </div>
                </div>

                {/* Dashboard Chính */}
                <div className={styles.mainGrid}>
                    <section className={styles.chartSection}>
                        <div className={styles.sectionTitle}>
                            <span>Tổng quan doanh thu</span>
                            <span className={styles.growthBadge}>+12.5%</span>
                        </div>
                        <div className={styles.bars}>
                            <div className={styles.bar} style={{ height: '40%' }}></div>
                            <div className={styles.bar} style={{ height: '60%' }}></div>
                            <div className={styles.bar} style={{ height: '35%' }}></div>
                            <div className={styles.bar} style={{ height: '80%' }}></div>
                            <div className={styles.bar} style={{ height: '70%' }}></div>
                            <div className={`${styles.bar} ${styles.barActive}`} style={{ height: '90%' }}></div>
                            <div className={styles.bar} style={{ height: '50%' }}></div>
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            <span>Tháng trước</span>
                            <span>Hiện tại</span>
                        </div>
                    </section>

                    <div className={styles.sideCards}>
                        <article className={styles.countCard}>
                            <p className={styles.countLabel}>Số lượng đơn hàng</p>
                            <h4 className={styles.countValue}>1,284</h4>
                            <p className="text-[10px] text-gray-400 mt-1">Kỳ hạn: Tháng 10/2023</p>
                            <div className="w-full bg-gray-50 h-1.5 rounded-full mt-6">
                                <div className="bg-[#3451B2] w-3/4 h-full rounded-full"></div>
                            </div>
                        </article>

                        <article className={styles.alertCard}>
                            <div className="flex items-center gap-3 mb-4">
                                <Bell size={16} className="animate-bounce" />
                                <h4 className={styles.alertTitle}>Cảnh báo tồn kho</h4>
                            </div>
                            <h5 className={styles.alertValue}>
                                {products.filter(p => p.stock_quantity < 10).length < 10 ? '0' : ''}
                                {products.filter(p => p.stock_quantity < 10).length}
                            </h5>
                            <p className="text-[10px] text-blue-100/70 uppercase font-bold">Mặt hàng cần nhập thêm gấp</p>
                        </article>
                    </div>
                </div>

                {/* Bảng Quản lý kho */}
                <section className={styles.inventorySection}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Quản lý Kho hàng</h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Tìm tên sản phẩm..." 
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Sản phẩm</th>
                                <th className={styles.th} style={{ textAlign: 'center' }}>Tồn kho</th>
                                <th className={styles.th} style={{ textAlign: 'right', paddingRight: '3rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className={styles.td}>
                                        <div className={styles.productInfo}>
                                            <img src={product.image_url} alt="" className={styles.productImg} />
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-black">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <span className={`${styles.stockBadge} ${product.stock_quantity < 10 ? styles.badgeLow : styles.badgeNormal}`}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button className={`${styles.miniBtn} ${styles.btnImport}`} onClick={() => handleUpdateStock(product.id, 'import')}>Nhập</button>
                                            <button className={`${styles.miniBtn} ${styles.btnExportMini}`} onClick={() => handleUpdateStock(product.id, 'export')}>Xuất</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tạo phiếu nhập hàng mới">
                    <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">Tên sản phẩm</label>
                            <input type="text" className="p-2.5 border rounded-lg text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Hãng sản xuất</label>
                                <input type="text" className="p-2.5 border rounded-lg text-sm" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Giá bán (VND)</label>
                                <input type="number" className="p-2.5 border rounded-lg text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">URL Hình ảnh</label>
                            <input type="text" className="p-2.5 border rounded-lg text-sm" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                        </div>
                        <button type="submit" className={styles.btnPrimary} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Lưu và Nhập kho</button>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default AdminPage;
