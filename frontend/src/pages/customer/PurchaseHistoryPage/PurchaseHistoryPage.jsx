import { useState, useEffect } from 'react';
import Header from '../../../components/common/Header/Header';
import Modal from '../../../components/common/Modal/Modal';
import { apiService } from '../../../services/apiService';
import { Package, Calendar, MapPin, Search } from 'lucide-react';
import styles from './PurchaseHistoryPage.module.css';

const PurchaseHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await apiService.getMyOrders();
                setOrders(data);
            } catch (err) {
                setError(err.message || 'Lỗi khi lấy danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const viewDetails = async (orderId) => {
        setSelectedOrder(orderId);
        setDetailsLoading(true);
        try {
            const data = await apiService.getMyOrderDetails(orderId);
            setOrderDetails(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const normalizedStatus = (status || '').toString().toLowerCase();
        switch (normalizedStatus) {
            case 'pending':
            case '0':
                return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ xử lý</span>;
            case 'processing':
            case 'shipped':
            case '1':
                return <span className={`${styles.badge} ${styles.badgeProcessing}`}>Đang giao hàng</span>;
            case 'completed':
            case '2':
                return <span className={`${styles.badge} ${styles.badgeCompleted}`}>Hoàn thành</span>;
            case 'cancelled':
            case '-1':
                return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Đã hủy</span>;
            default: return <span className={styles.badge}>{status || 'Không rõ'}</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const datePart = date.toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const timePart = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        });
        return `${timePart} ${datePart}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <h1 className={styles.title}>Lịch sử mua hàng</h1>

                {loading ? (
                    <div className={styles.statusMessage}>Đang tải danh sách đơn hàng...</div>
                ) : error ? (
                    <div className={styles.errorMessage}>{error}</div>
                ) : orders.length === 0 ? (
                    <div className={styles.statusMessage}>
                        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        Bạn chưa có đơn hàng nào.
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderInfo}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderId}>Mã ĐH: #{order.id}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className={styles.orderDate}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
                                        {formatDate(order.created_at)}
                                    </div>
                                    <div className={styles.itemCount}>
                                        <Package size={14} /> {order.item_count} sản phẩm
                                    </div>
                                    <div className={styles.orderAmount}>
                                        {formatPrice(order.total_amount)}
                                    </div>
                                </div>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => viewDetails(order.id)}
                                >
                                    <Search size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                                    Xem chi tiết
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Modal
                isOpen={!!selectedOrder}
                onClose={() => { setSelectedOrder(null); setOrderDetails(null); }}
                title={`Chi tiết đơn hàng #${selectedOrder}`}
                size="md"
            >
                {detailsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải chi tiết...</div>
                ) : orderDetails ? (
                    <div>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Trạng thái:</strong> {getStatusBadge(orderDetails.status)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Tổng tiền:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatPrice(orderDetails.total_amount)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <MapPin size={18} color="#64748b" />
                                <span style={{ color: '#475569' }}>{orderDetails.shipping_address}</span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#0f172a' }}>Sản phẩm đã đặt</h3>
                        <div>
                            {orderDetails.items?.map((item, idx) => (
                                <div key={idx} className={styles.detailItem}>
                                    <div className={styles.itemImage}>
                                        <Package size={32} color="#94a3b8" style={{ margin: 'auto', display: 'block', marginTop: '10px' }} />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <h4 className={styles.itemName}>{item.product_name}</h4>
                                        <div className={styles.itemQty}>Số lượng: {item.quantity}</div>
                                        {item.serials && item.serials.length > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                SN: {item.serials.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemPrice}>
                                        {formatPrice(item.unit_price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#ef4444' }}>Lỗi khi lấy chi tiết đơn hàng</div>
                )}
            </Modal>
        </div>
    );
};

export default PurchaseHistoryPage;
