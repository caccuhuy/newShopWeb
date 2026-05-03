import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, XCircle, Clock, Truck, Eye, ShieldCheck, Package, Search } from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from "./OrderManagementPage.module.css";
import { clsx } from 'clsx';

const OrderManagementPage = () => {
    const { isStaff, isAdmin, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    
    // Helper to format image URL
    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };
    
    // Modal states
    const [orderDetails, setOrderDetails] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleViewDetail = async (order) => {
        try {
            const details = await apiService.getOrderById(order.id);
            setOrderDetails(details);
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: error.message
            });
        }
    };

    const handleConfirmTransfer = (orderId) => {
        setAlertConfig({
            isOpen: true,
            type: 'warning',
            title: 'Xác nhận chuyển kho',
            message: 'Xác nhận đơn hàng và chuyển sang bộ phận kho xử lý?',
            onConfirm: async () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const result = await apiService.processOrderExport(orderId, []);
                    loadOrders();
                    setAlertConfig({
                        isOpen: true,
                        type: 'success',
                        title: 'Thành công',
                        message: `Đơn hàng đã được chuyển sang bộ phận kho. Mã phiếu xuất nháp: ${result.docId}`
                    });
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Lỗi',
                        message: error.message
                    });
                }
            }
        });
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        const actionText = newStatus === 'cancelled' ? 'hủy' : 'cập nhật';
        setAlertConfig({
            isOpen: true,
            type: newStatus === 'cancelled' ? 'error' : 'warning',
            title: 'Xác nhận thay đổi',
            message: `Bạn có chắc muốn ${actionText} đơn hàng này?`,
            onConfirm: async () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await apiService.updateOrderStatus(orderId, newStatus);
                    loadOrders();
                    setAlertConfig({
                        isOpen: true,
                        type: 'success',
                        title: 'Thành công',
                        message: `Đã cập nhật trạng thái đơn hàng thành ${newStatus === 'cancelled' ? 'Đã hủy' : newStatus}.`
                    });
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Lỗi',
                        message: error.message
                    });
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className={clsx(styles.stockBadge, "bg-orange-50 text-orange-600")}>Chờ xác nhận</span>;
            case 'processing': return <span className={clsx(styles.stockBadge, "bg-blue-50 text-blue-600")}>Chờ xuất kho</span>;
            case 'completed': return <span className={clsx(styles.stockBadge, styles.badgeNormal)}>Đã hoàn thành</span>;
            case 'cancelled': return <span className={clsx(styles.stockBadge, styles.badgeLow)}>Đã hủy</span>;
            default: return <span className={styles.stockBadge}>{status}</span>;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.customer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_info?.phone?.includes(searchTerm) ||
            order.id.toString().includes(searchTerm);
        const matchesStatus = filterStatus === '' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (!isStaff) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Quản lý Đơn hàng</h2>
                        <p className={styles.subtitle}>Quy trình xác nhận và chuyển kho xử lý.</p>
                    </div>
                </header>

                <section className={styles.inventorySection}>
                    <div className={styles.tableToolbar}>
                        <h3 className={styles.sectionTitle}>Danh sách đơn hàng</h3>
                        <div className={styles.filterGroup}>
                            <div className={styles.searchBox}>
                                <Search size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo khách hàng hoặc mã đơn..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className={styles.filterSelect}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="processing">Chờ xuất kho</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Mã đơn / Ngày</th>
                                <th className={styles.th}>Khách hàng</th>
                                <th className={styles.th}>Tổng tiền</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={styles.th} style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className={styles.emptyState}>Đang tải...</td></tr>
                            ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textBold, styles.textSmall)}>#{order.id}</div>
                                        <div className={clsx(styles.textXS, styles.textMuted, styles.textBlack)}>{new Date(order.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textBold, styles.textSmall)}>{order.customer_info?.name}</div>
                                        <div className={clsx(styles.textXS, styles.textMuted)}>{order.customer_info?.phone}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={clsx(styles.textBlack, styles.textPrimary)}>{order.total_amount?.toLocaleString()}đ</span>
                                        <div className={clsx(styles.textXS, styles.textMuted, styles.uppercase)}>{order.item_count} sản phẩm</div>
                                    </td>
                                    <td className={styles.td}>
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            {order.status === 'pending' && (
                                                <>
                                                    <button 
                                                        className={clsx(styles.miniBtn, "bg-blue-500 text-white")} 
                                                        title="Xác nhận & Chuyển kho"
                                                        onClick={() => handleConfirmTransfer(order.id)}
                                                    >
                                                        <Truck size={12} />
                                                    </button>
                                                    <button 
                                                        className={clsx(styles.miniBtn, "bg-red-500 text-white")} 
                                                        title="Hủy đơn"
                                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                    >
                                                        <XCircle size={12} />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className={clsx(styles.miniBtn, styles.btnReset)} 
                                                title="Xem chi tiết"
                                                onClick={() => handleViewDetail(order)}
                                            >
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className={styles.emptyState}>
                                        <Clock size={40} className={styles.emptyIcon} />
                                        <p className={clsx(styles.textMuted, styles.textBold)}>Chưa có đơn hàng nào để hiển thị</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* Detail Modal */}
                <Modal
                    isOpen={!!orderDetails}
                    onClose={() => setOrderDetails(null)}
                    title="Chi tiết Đơn hàng"
                    width="800px"
                >
                    {orderDetails && (
                        <div className={styles.modalContent}>
                            <div className={styles.orderBrief}>
                                <div className={styles.infoItem}>
                                    <label>Mã Đơn Hàng</label>
                                    <p>#{orderDetails.order_id}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Khách Hàng</label>
                                    <p>{orderDetails.customer_info.name} - {orderDetails.customer_info.phone}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Ngày Đặt</label>
                                    <p>{new Date(orderDetails.created_at).toLocaleString()}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Địa Chỉ Giao Hàng</label>
                                    <p>{orderDetails.shipping_address}</p>
                                </div>
                            </div>

                            <div className={styles.productList}>
                                <h4 className={styles.textBold} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Package size={18} /> Danh sách sản phẩm
                                </h4>
                                {orderDetails.items.map(item => {
                                    return (
                                        <div key={item.product_id} className={styles.productItem}>
                                            <div className={styles.productHeader}>
                                                <div className={styles.productInfo}>
                                                    <img src={formatImageUrl(item.image_url)} className={styles.productThumb} alt="" />
                                                    <div>
                                                        <div className={styles.textBold}>{item.product_name}</div>
                                                        <div className={styles.textXS}>Số lượng đặt: <span className={styles.textBold}>{item.quantity}</span></div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className={styles.textPrimary}>{item.price_at_time?.toLocaleString()}đ</div>
                                                    {item.serials && item.serials.length > 0 && (
                                                        <div className={styles.textXS} style={{ marginTop: '0.5rem' }}>
                                                            <span className={styles.textMuted}>Số Serial: </span>
                                                            <span className={styles.textBold}>{item.serials.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setOrderDetails(null)}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onConfirm={alertConfig.onConfirm}
                />
            </div>
        </AdminLayout>
    );
};

export default OrderManagementPage;
