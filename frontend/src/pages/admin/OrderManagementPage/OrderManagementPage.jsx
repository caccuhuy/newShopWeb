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
    const [filterStatus, setFilterStatus] = useState('');
    
    // Helper to format image URL
    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };
    
    // Modal states
    const [processModal, setProcessModal] = useState({ isOpen: false, order: null });
    const [orderDetails, setOrderDetails] = useState(null);
    const [stockStatus, setStockStatus] = useState([]);
    const [selectedSerials, setSelectedSerials] = useState({}); // { product_id: [sn1, sn2] }
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

    const handleOpenProcess = async (order) => {
        try {
            const details = await apiService.getOrderById(order.id);
            const stock = await apiService.checkOrderStock(order.id);
            
            setOrderDetails(details);
            setStockStatus(stock);
            
            // Initialize empty serials
            const initialSerials = {};
            details.items.forEach(item => {
                initialSerials[item.product_id] = Array(item.quantity).fill('');
            });
            setSelectedSerials(initialSerials);
            
            setProcessModal({ isOpen: true, order });
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: error.message
            });
        }
    };

    const handleAutoFill = (productId) => {
        const stockItem = stockStatus.find(s => s.product_id === productId);
        if (!stockItem) return;

        const newSerials = { ...selectedSerials };
        const available = stockItem.available_serials;
        
        // Take N first available serials
        newSerials[productId] = newSerials[productId].map((_, idx) => available[idx] || '');
        setSelectedSerials(newSerials);
    };

    const handleSerialChange = (productId, index, value) => {
        const newSerials = { ...selectedSerials };
        newSerials[productId][index] = value;
        setSelectedSerials(newSerials);
    };

    const handleProcessExport = async () => {
        // Prepare payload
        const serialList = [];
        let allFilled = true;

        orderDetails.items.forEach(item => {
            const sns = selectedSerials[item.product_id];
            sns.forEach(sn => {
                if (!sn) allFilled = false;
                serialList.push({
                    product_id: item.product_id,
                    serial_number: sn,
                    unit_price: item.price_at_time || item.unit_price // from Order_Details
                });
            });
        });

        if (!allFilled) {
            setAlertConfig({
                isOpen: true,
                type: 'warning',
                title: 'Thiếu thông tin',
                message: 'Vui lòng điền đủ mã Serial cho tất cả sản phẩm.'
            });
            return;
        }

        try {
            await apiService.processOrderExport(processModal.order.id, serialList);
            
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: 'Đã tạo phiếu xuất kho và cập nhật trạng thái đơn hàng.'
            });
            
            setProcessModal({ isOpen: false, order: null });
            loadOrders();
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: error.message
            });
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await apiService.updateOrderStatus(orderId, newStatus);
            loadOrders();
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: `Đã cập nhật trạng thái đơn hàng thành ${newStatus}.`
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className={clsx(styles.stockBadge, "bg-orange-50 text-orange-600")}>Chờ xác nhận</span>;
            case 'shipping': return <span className={clsx(styles.stockBadge, "bg-blue-50 text-blue-600")}>Đang giao</span>;
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
                        <p className={styles.subtitle}>Quy trình xử lý đơn hàng và xuất kho vật lý.</p>
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
                                <option value="shipping">Đang giao</option>
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
                                                        title="Xử lý và Xuất kho"
                                                        onClick={() => handleOpenProcess(order)}
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
                                            {order.status === 'shipping' && (
                                                <button 
                                                    className={clsx(styles.miniBtn, "bg-green-500 text-white")} 
                                                    title="Hoàn thành đơn"
                                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                >
                                                    <CheckCircle size={12} />
                                                </button>
                                            )}
                                            <button 
                                                className={clsx(styles.miniBtn, styles.btnReset)} 
                                                title="Xem chi tiết"
                                                onClick={() => handleOpenProcess(order)}
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

                {/* Processing Modal */}
                <Modal
                    isOpen={processModal.isOpen}
                    onClose={() => {
                        setProcessModal({ isOpen: false, order: null });
                        setOrderDetails(null);
                    }}
                    title={processModal.order?.status === 'pending' ? "Xử lý & Xuất kho Đơn hàng" : "Chi tiết Đơn hàng"}
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
                                    const stock = stockStatus.find(s => s.product_id === item.product_id);
                                    const isPending = processModal.order?.status === 'pending';
                                    const isEnough = stock ? stock.available >= item.quantity : false;

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
                                                    {isPending && (
                                                        <div className={clsx(styles.stockStatus, isEnough ? styles.statusOk : styles.statusError)}>
                                                            {isEnough ? `Sẵn sàng (Kho: ${stock.available})` : `Thiếu hàng (Kho: ${stock.available})`}
                                                        </div>
                                                    )}
                                                    {!isPending && item.serials && item.serials.length > 0 && (
                                                        <div className={styles.textXS} style={{ marginTop: '0.5rem' }}>
                                                            <span className={styles.textMuted}>Số Serial: </span>
                                                            <span className={styles.textBold}>{item.serials.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {isPending && isEnough && (
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <label className={styles.textXS} style={{ fontWeight: 600 }}>Nhập mã Serial để xuất:</label>
                                                        <button 
                                                            className={styles.autoFillBtn}
                                                            onClick={() => handleAutoFill(item.product_id)}
                                                        >
                                                            Tự động điền Serial
                                                        </button>
                                                    </div>
                                                    <div className={styles.serialInputs}>
                                                        {selectedSerials[item.product_id]?.map((sn, idx) => (
                                                            <div key={idx} className={styles.serialField}>
                                                                <input 
                                                                    placeholder={`Serial #${idx + 1}`}
                                                                    value={sn}
                                                                    onChange={(e) => handleSerialChange(item.product_id, idx, e.target.value)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => {
                                    setProcessModal({ isOpen: false, order: null });
                                    setOrderDetails(null);
                                }}>
                                    Đóng
                                </button>
                                {processModal.order?.status === 'pending' && (
                                    <button 
                                        className={styles.btnPrimary}
                                        disabled={!stockStatus.every(s => {
                                            const item = orderDetails.items.find(i => i.product_id === s.product_id);
                                            return s.available >= (item?.quantity || 0);
                                        })}
                                        onClick={handleProcessExport}
                                    >
                                        <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
                                        Xác nhận Xuất kho & Giao hàng
                                    </button>
                                )}
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
                />
            </div>
        </AdminLayout>
    );
};

export default OrderManagementPage;
