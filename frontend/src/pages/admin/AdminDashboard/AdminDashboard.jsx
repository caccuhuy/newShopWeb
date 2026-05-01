import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { Bell, TrendingUp, TrendingDown, Package, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from "./AdminDashboard.module.css";
import { clsx } from 'clsx';

const AdminPage = () => {
    const { isStaff, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockQuantity, setStockQuantity] = useState(10);
    const [stockType, setStockType] = useState('import');

    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', price: '', stock_quantity: 20, image_url: 'https://via.placeholder.com/150'
    });

    const fetchProducts = async () => {
        try {
            const data = await apiService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!isStaff) {
            navigate('/login');
            return;
        }

        let isMounted = true;
        const fetchData = async () => {
            const data = await apiService.getProducts();
            if (isMounted) {
                setProducts(data);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [isStaff, navigate]);

    const handleUpdateStock = (product, type) => {
        setSelectedProduct(product);
        setStockType(type);
        setStockQuantity(10);
        setShowStockModal(true);
    };

    const confirmUpdateStock = async (e) => {
        e.preventDefault();
        const action = stockType === 'import' ? 'NHẬP THÊM' : 'XUẤT KHO';

        try {
            const newStock = await apiService.updateStock(selectedProduct.id, stockType, parseInt(stockQuantity));
            setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock_quantity: newStock } : p));
            setShowStockModal(false);
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: `${action} thành công!`
            });
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: error.message
            });
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
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: 'Đã tạo phiếu nhập hàng và thêm sản phẩm mới thành công!'
            });
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: error.message
            });
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
                        {isAdmin && (
                            <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>Tạo phiếu mới</button>
                        )}
                    </div>
                </header>

                <div className={styles.quickStats}>
                    <div className={styles.quickCard}>
                        <div className={clsx(styles.iconCircle, styles.bgBlue)}>🏢</div>
                        <p className={styles.quickLabel}>Nhà cung cấp</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={clsx(styles.iconCircle, styles.bgPurple)}>📄</div>
                        <p className={styles.quickLabel}>Các loại phiếu</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={clsx(styles.iconCircle, styles.bgGreen)}>🏠</div>
                        <p className={styles.quickLabel}>Tình trạng kho</p>
                    </div>
                    <div className={styles.quickCard}>
                        <div className={clsx(styles.iconCircle, styles.bgOrange)}>📈</div>
                        <p className={styles.quickLabel}>Báo cáo thống kê</p>
                    </div>
                </div>

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
                            <div className={clsx(styles.bar, styles.barActive)} style={{ height: '90%' }}></div>
                            <div className={styles.bar} style={{ height: '50%' }}></div>
                        </div>
                        <div className={styles.chartLegend}>
                            <span>Tháng trước</span>
                            <span>Hiện tại</span>
                        </div>
                    </section>

                    <div className={styles.sideCards}>
                        <article className={styles.countCard}>
                            <p className={styles.countXS}>Số lượng đơn hàng</p>
                            <h4 className={styles.countValue}>1,284</h4>
                            <p className={styles.countSub}>Kỳ hạn: Tháng 10/2023</p>
                            <div className={styles.progressTrack}>
                                <div className={styles.progressBar}></div>
                            </div>
                        </article>

                        <article className={styles.alertCard}>
                            <div className={styles.alertHeader}>
                                <Bell size={16} className={styles.animateBounce} />
                                <h4 className={styles.alertTitle}>Cảnh báo tồn kho</h4>
                            </div>
                            <h5 className={styles.alertValue}>
                                {products.filter(p => p.stock_quantity < 10).length < 10 ? '0' : ''}
                                {products.filter(p => p.stock_quantity < 10).length}
                            </h5>
                            <p className={styles.alertDesc}>Mặt hàng cần nhập thêm gấp</p>
                        </article>
                    </div>
                </div>

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
                                                <div className={clsx(styles.textBold, styles.textSmall)}>{product.name}</div>
                                                <div className={clsx(styles.textXS, styles.textMuted, styles.uppercase, styles.textBlack)}>{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <span className={clsx(styles.stockBadge, product.stock_quantity < 10 ? styles.badgeLow : styles.badgeNormal)}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button className={clsx(styles.miniBtn, styles.btnImport)} onClick={() => handleUpdateStock(product, 'import')}>Nhập</button>
                                            <button className={clsx(styles.miniBtn, styles.btnExportMini)} onClick={() => handleUpdateStock(product, 'export')}>Xuất</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tạo phiếu nhập hàng mới">
                    <form onSubmit={handleAddProduct} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Tên sản phẩm</label>
                            <input type="text" className={styles.inputField} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                        </div>
                        <div className={styles.formGrid2}>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Hãng sản xuất</label>
                                <input type="text" className={styles.inputField} value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Giá bán (VND)</label>
                                <input type="number" className={styles.inputField} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>URL Hình ảnh</label>
                            <input type="text" className={styles.inputField} value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                        </div>
                        <button type="submit" className={clsx(styles.btnPrimary, styles.btnFull)}>Lưu và Nhập kho</button>
                    </form>
                </Modal>

                {/* Modal Cập nhật tồn kho (Nhập/Xuất) */}
                <Modal
                    isOpen={showStockModal}
                    onClose={() => setShowStockModal(false)}
                    title={stockType === 'import' ? "Nhập thêm hàng vào kho" : "Xuất hàng khỏi kho"}
                    size="sm"
                >
                    <form onSubmit={confirmUpdateStock} className={styles.form}>
                        <div className={styles.confirmContent} style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div className={clsx(styles.iconCircle, stockType === 'import' ? styles.bgGreen : styles.bgOrange)} style={{ margin: '0 auto 1rem' }}>
                                {stockType === 'import' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <h4 className={styles.textBold}>{selectedProduct?.name}</h4>
                            <p className={styles.textXS} style={{ color: '#666' }}>Hiện có: {selectedProduct?.stock_quantity} sản phẩm</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Số lượng muốn {stockType === 'import' ? 'nhập' : 'xuất'}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className={styles.inputField} 
                                    value={stockQuantity} 
                                    onChange={e => setStockQuantity(e.target.value)} 
                                    min="1"
                                    required 
                                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                                />
                                <Package size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            </div>
                        </div>

                        <div className={styles.rowActions} style={{ marginTop: '1.5rem', justifyContent: 'flex-end', gap: '0.75rem', display: 'flex' }}>
                            <button type="button" className={styles.btnExport} onClick={() => setShowStockModal(false)} style={{ margin: 0 }}>Hủy</button>
                            <button type="submit" className={styles.btnPrimary}>Xác nhận {stockType === 'import' ? 'Nhập' : 'Xuất'}</button>
                        </div>
                    </form>
                </Modal>

                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminPage;
