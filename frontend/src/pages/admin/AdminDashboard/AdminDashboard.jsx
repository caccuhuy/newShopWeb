import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { 
    TrendingUp, Package, DollarSign, ShoppingCart, Users, Calendar,
    ArrowUpRight, ArrowDownRight
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
    
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        lowStockCount: 0,
        kpis: {},
        revenueData: [],
        lowStockProducts: []
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);
    const [chartType, setChartType] = useState('line');
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [allLowStock, setAllLowStock] = useState([]);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);

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

    const handleViewAllStock = async () => {
        try {
            setIsStockModalOpen(true);
            const data = await apiService.getLowStockProducts();
            setAllLowStock(data);
        } catch (error) {
            console.error('Fetch low stock error:', error);
        }
    };

    useEffect(() => {
        if (!isStaff) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [isStaff, navigate, timeRange]);

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
                                <button 
                                    className={clsx(styles.chartBtn, chartType === 'line' && styles.chartBtnActive)}
                                    onClick={() => setChartType('line')}
                                >
                                    Line
                                </button>
                                <button 
                                    className={clsx(styles.chartBtn, chartType === 'bar' && styles.chartBtnActive)}
                                    onClick={() => setChartType('bar')}
                                >
                                    Bar
                                </button>
                            </div>
                        </div>
                        <div className={styles.chartWrapper}>
                            {loading ? (
                                <div className={styles.loadingChart}>Đang tải biểu đồ...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    {chartType === 'line' ? (
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
                                    ) : (
                                        <BarChart data={stats?.revenueData || []}>
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
                                            <Bar dataKey="revenue" fill="#3451B2" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <div className={styles.sideColumn}>
                        <section className={styles.lowStockList}>
                            <div className={styles.sideHeader}>
                                <h3 className={styles.sideTitle}>Cảnh báo tồn kho</h3>
                                <button className={styles.viewAllBtn} onClick={handleViewAllStock}>Tất cả</button>
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
                    </div>
                </div>

                <Modal 
                    isOpen={isStockModalOpen} 
                    onClose={() => setIsStockModalOpen(false)} 
                    title="Tất cả cảnh báo tồn kho (Dưới 10 cái)"
                    width="600px"
                >
                    <div style={{padding: '1rem'}}>
                        <div style={{maxHeight: '500px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem'}}>
                            {allLowStock.length > 0 ? (
                                allLowStock.map(p => (
                                    <div key={p.id} style={{
                                        padding: '1rem', 
                                        borderBottom: '1px solid #f1f5f9', 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{p.name}</div>
                                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>{p.brand}</div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '1rem', 
                                            background: '#fff7ed', 
                                            color: '#d97706', 
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            border: '1px solid #ffedd5'
                                        }}>
                                            {p.stock} cái
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>Không có sản phẩm nào sắp hết hàng.</div>
                            )}
                        </div>
                    </div>
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
