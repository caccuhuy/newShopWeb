import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, Truck, Eye } from 'lucide-react';
import styles from '../AdminPage/AdminPage.module.css';
import { clsx } from 'clsx';

const OrderManagementPage = () => {
    const { isStaff, isAdmin, user } = useAuth();
    const [orders, setOrders] = useState([]);

    const loadOrders = useCallback(async () => {
        try {
            const data = await apiService.getOrders();
            setOrders(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        const actionText = newStatus === 'shipping' ? 'xác nhận giao' : (newStatus === 'completed' ? 'hoàn thành' : 'hủy');
        
        try {
            await apiService.updateOrderStatus(orderId, newStatus);
            
            await apiService.addActivityLog({
                user: user.name,
                email: user.email,
                action: `Đã ${actionText} đơn hàng #${orderId}`,
                type: newStatus === 'cancelled' ? 'danger' : 'success'
            });

            loadOrders();
            alert(`Đã ${actionText} đơn hàng thành công!`);
        } catch (error) {
            alert(error.message);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className={clsx(styles.stockBadge, "bg-orange-50 text-orange-600")}>Chờ xác nhận</span>;
            case 'shipping': return <span className={clsx(styles.stockBadge, "bg-blue-50 text-blue-600")}>Đang giao</span>;
            case 'completed': return <span className={clsx(styles.stockBadge, styles.badgeNormal)}>Đã hoàn thành</span>;
            case 'cancelled': return <span className={clsx(styles.stockBadge, styles.badgeLow)}>Đã hủy</span>;
            default: return <span className={styles.stockBadge}>{status}</span>;
        }
    };

    if (!isStaff) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Quản lý Đơn hàng</h2>
                        <p className={styles.subtitle}>Nhân viên và Admin đều có quyền xử lý đơn hàng.</p>
                    </div>
                </header>

                <section className={styles.inventorySection}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Danh sách đơn hàng</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Mã đơn / Ngày</th>
                                <th className={styles.th}>Khách hàng</th>
                                <th className={styles.th}>Tổng tiền</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={styles.th} style={{ textAlign: 'right', paddingRight: '3rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map(order => (
                                <tr key={order.id}>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textBold, styles.textSmall)}>#{order.id}</div>
                                        <div className={clsx(styles.textXS, styles.textMuted, styles.textBlack)}>{new Date(order.id).toLocaleString()}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textBold, styles.textSmall)}>{order.customer_info?.name}</div>
                                        <div className={clsx(styles.textXS, styles.textMuted)}>{order.customer_info?.phone}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={clsx(styles.textBlack, styles.textPrimary)}>{order.total_amount?.toLocaleString()}đ</span>
                                        <div className={clsx(styles.textXS, styles.textMuted, styles.uppercase)}>{order.items?.length} sản phẩm</div>
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
                                                        title="Xác nhận giao hàng"
                                                        onClick={() => handleUpdateStatus(order.id, 'shipping')}
                                                    >
                                                        <Truck size={12} />
                                                    </button>
                                                    
                                                    {isAdmin && (
                                                        <button 
                                                            className={clsx(styles.miniBtn, "bg-red-500 text-white")} 
                                                            title="Hủy đơn"
                                                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                        >
                                                            <XCircle size={12} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {order.status === 'shipping' && (
                                                <button 
                                                    className={clsx(styles.miniBtn, "bg-green-500 text-white")} 
                                                    title="Hoàn thành đơn"
                                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                >
                                                    <CheckCircle size={12} />
                                                </button>
                                            )}
                                            <button className={clsx(styles.miniBtn, styles.btnReset)} title="Xem chi tiết">
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
            </div>
        </AdminLayout>
    );
};

export default OrderManagementPage;
