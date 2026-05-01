import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { 
    Bell, TrendingUp, TrendingDown, Package, CheckCircle, 
    AlertCircle, DollarSign, ShoppingCart, Users, Calendar,
    ArrowUpRight, ArrowDownRight, MoreHorizontal, Search
} from 'lucide-react';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from "./AdminDashboard.module.css";
import { clsx } from 'clsx';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar 
} from 'recharts';

const AdminPage = () => {
    const { isStaff, isAdmin } = useAuth();
    const navigate = useNavigate();
    
    // Analytics State
    const [stats, setStats] = useState(null);
    const [timeRange, setTimeRange] = useState(30);
    const [loading, setLoading] = useState(true);

    // Inventory State
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, productsData] = await Promise.all([
                apiService.getDashboardStats(timeRange),
                apiService.getProducts()
            ]);
            setStats(statsData);
            setProducts(productsData);
        } catch (error) {
            console.error('Fetch error:', error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi tải dữ liệu',
                message: 'Không thể kết nối với máy chủ.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStaff) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [isStaff, navigate, timeRange]);

    const handleUpdateStock = (product, type) => {
        setSelectedProduct(product);
        setStockType(type);
        setStockQuantity(10);
        setShowStockModal(true);
    };

    const confirmUpdateStock = async (e) => {
        e.preventDefault();
        try {
            const newStock = await apiService.updateStock(selectedProduct.id, stockType, parseInt(stockQuantity));
            setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock_quantity: newStock } : p));
            setShowStockModal(false);
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: 'Cập nhật kho thành công!'
            });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
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
            fetchData();
            setAlertConfig({
                isOpen: true, type: 'success', title: 'Thành công',
                message: 'Đã thêm sản phẩm mới thành công!'
            });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    const filteredProducts = useMemo(() => 
        products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]
    );

    if (!isStaff) return null;

    const kpiCards = [
        { 
            title: 'Tổng doanh thu', 
            value: stats?.kpis?.totalRevenue?.toLocaleString('vi-VN') + ' đ', 
            icon: <DollarSign size={20} />, 
            color: styles.bgBlue,
            trend: '+12.5%',
            trendUp: true
        },
        { 
            title: 'Đơn hàng', 
            value: stats?.kpis?.totalOrders || 0, 
            icon: <ShoppingCart size={20} />, 
            color: styles.bgPurple,
            trend: '+5.2%',
            trendUp: true
        },
        { 
            title: 'Khách hàng mới', 
            value: stats?.kpis?.newCustomers || 0, 
            icon: <Users size={20} />, 
            color: styles.bgGreen,
            trend: '+8.1%',
            trendUp: true
        },
        { 
            title: 'Tồn kho thấp', 
            value: stats?.kpis?.lowStockCount || 0, 
            icon: <Package size={20} />, 
            color: styles.bgOrange,
            trend: '-2.4%',
            trendUp: false
        }
    ];

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Báo cáo & Phân tích</h2>
                        <p className={styles.subtitle}>Theo dõi hiệu suất kinh doanh của cửa hàng.</p>
                    </div>
                    <div className={styles.actions}>
                        <div className={styles.timeFilter}>
                            <Calendar size={14} className="mr-2" />
                            <select 
                                value={timeRange} 
                                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                                className={styles.selectFilter}
                            >
                                <option value={7}>7 ngày qua</option>
                                <option value={30}>30 ngày qua</option>
                                <option value={90}>90 ngày qua</option>
                            </select>
                        </div>
                        {isAdmin && (
                            <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
                                <TrendingUp size={16} style={{marginRight: '8px'}} />
                                Nhập hàng mới
                            </button>
                        )}
                    </div>
                </header>

                <div className={styles.quickStats}>
                    {kpiCards.map((kpi, idx) => (
                        <div key={idx} className={styles.kpiCard}>
                            <div className={styles.kpiHeader}>
                                <div className={clsx(styles.kpiIcon, kpi.color)}>{kpi.icon}</div>
                                <span className={clsx(styles.trend, kpi.trendUp ? styles.trendUp : styles.trendDown)}>
                                    {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {kpi.trend}
                                </span>
                            </div>
                            <h3 className={styles.kpiValue}>{loading ? '...' : kpi.value}</h3>
                            <p className={styles.kpiLabel}>{kpi.title}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.mainGrid}>
                    <section className={styles.chartSection}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Xu hướng doanh thu</h3>
                            <div className={styles.chartActions}>
                                <button className={clsx(styles.chartBtn, styles.chartBtnActive)}>Line</button>
                                <button className={styles.chartBtn}>Bar</button>
                            </div>
                        </div>
                        <div className={styles.chartWrapper}>
                            {loading ? (
                                <div className={styles.loadingChart}>Đang tải biểu đồ...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={stats?.revenueData || []}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3451B2" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3451B2" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 10, fill: '#9ca3af'}}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 10, fill: '#9ca3af'}}
                                            tickFormatter={(val) => `${val/1000000}M`}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                            formatter={(val) => [val.toLocaleString() + ' đ', 'Doanh thu']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#3451B2" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorRev)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <div className={styles.sideColumn}>
                        <section className={styles.lowStockList}>
                            <div className={styles.sideHeader}>
                                <h3 className={styles.sideTitle}>Cảnh báo tồn kho</h3>
                                <button className={styles.viewAllBtn}>Tất cả</button>
                            </div>
                            <div className={styles.stockItems}>
                                {loading ? (
                                    <p>Đang tải...</p>
                                ) : stats?.lowStockProducts?.length > 0 ? (
                                    stats.lowStockProducts.map(p => (
                                        <div key={p.id} className={styles.stockItem}>
                                            <div className={styles.stockInfo}>
                                                <span className={styles.stockName}>{p.name}</span>
                                                <span className={styles.stockBrand}>{p.brand}</span>
                                            </div>
                                            <span className={styles.stockCount}>{p.stock}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noData}>Không có cảnh báo</p>
                                )}
                            </div>
                        </section>
                        
                        <div className={styles.promoCard}>
                            <div className={styles.promoIcon}><AlertCircle size={20} /></div>
                            <p className={styles.promoText}>Bạn có <b>{stats?.kpis?.lowStockCount || 0}</b> mặt hàng cần nhập thêm để đảm bảo doanh số.</p>
                            <button className={styles.promoBtn} onClick={() => navigate('/admin/inventory')}>Xem kho</button>
                        </div>
                    </div>
                </div>

                <section className={styles.inventorySection}>
                    <div className={styles.tableHeader}>
                        <div>
                            <h3 className={styles.tableTitle}>Danh sách Sản phẩm & Kho</h3>
                            <p className={styles.tableSubtitle}>Quản lý nhập xuất và cập nhật tồn kho nhanh.</p>
                        </div>
                        <div className={styles.tableActions}>
                            <div className={styles.searchWrapper}>
                                <Search size={14} className={styles.searchIcon} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo tên hoặc hãng..." 
                                    className={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className={styles.btnIcon}><MoreHorizontal size={16} /></button>
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Sản phẩm</th>
                                <th className={styles.th} style={{ textAlign: 'center' }}>Tình trạng</th>
                                <th className={styles.th} style={{ textAlign: 'center' }}>Tồn kho</th>
                                <th className={styles.th} style={{ textAlign: 'right' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className={styles.td}>
                                        <div className={styles.productInfo}>
                                            <img src={product.image_url} alt="" className={styles.productImg} />
                                            <div>
                                                <div className={styles.pName}>{product.name}</div>
                                                <div className={styles.pBrand}>{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <span className={clsx(
                                            styles.statusDot, 
                                            product.stock_quantity > 10 ? styles.dotGreen : 
                                            product.stock_quantity > 0 ? styles.dotOrange : styles.dotRed
                                        )}></span>
                                        <span className={styles.statusLabel}>
                                            {product.stock_quantity > 10 ? 'Còn hàng' : 
                                             product.stock_quantity > 0 ? 'Sắp hết' : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <span className={clsx(styles.stockBadge, product.stock_quantity < 10 ? styles.badgeLow : styles.badgeNormal)}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button className={clsx(styles.miniBtn, styles.btnIn)} onClick={() => handleUpdateStock(product, 'import')}>Nhập</button>
                                            <button className={clsx(styles.miniBtn, styles.btnOut)} onClick={() => handleUpdateStock(product, 'export')}>Xuất</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Modals are kept for functionality */}
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nhập sản phẩm mới">
                    <form onSubmit={handleAddProduct} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Tên sản phẩm</label>
                            <input type="text" className={styles.inputField} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                        </div>
                        <div className={styles.formGrid2}>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Hãng</label>
                                <input type="text" className={styles.inputField} value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Giá (VND)</label>
                                <input type="number" className={styles.inputField} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Ảnh sản phẩm</label>
                            <input type="text" className={styles.inputField} value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                        </div>
                        <button type="submit" className={clsx(styles.btnPrimary, styles.btnFull)}>Xác nhận nhập kho</button>
                    </form>
                </Modal>

                <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title={stockType === 'import' ? "Nhập thêm hàng" : "Xuất hàng"} size="sm">
                    <form onSubmit={confirmUpdateStock} className={styles.form}>
                        <div className={styles.confirmHeader}>
                            <div className={clsx(styles.iconCircle, stockType === 'import' ? styles.bgGreen : styles.bgOrange)}>
                                {stockType === 'import' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <h4>{selectedProduct?.name}</h4>
                            <p>Kho hiện tại: {selectedProduct?.stock_quantity}</p>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Số lượng</label>
                            <input type="number" className={styles.inputField} value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} min="1" required />
                        </div>
                        <div className={styles.modalActions}>
                            <button type="button" className={styles.btnGhost} onClick={() => setShowStockModal(false)}>Hủy</button>
                            <button type="submit" className={styles.btnPrimary}>Xác nhận</button>
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
