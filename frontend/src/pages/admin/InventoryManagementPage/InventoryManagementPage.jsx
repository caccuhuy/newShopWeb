import { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { apiService } from '../../../services/apiService';
import { Plus, Eye, Search, Filter, Package } from 'lucide-react';
import DocumentFormModal from './components/DocumentFormModal';
import Modal from '../../../components/common/Modal/Modal';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from './InventoryManagementPage.module.css';
import clsx from 'clsx';

const InventoryManagementPage = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingDocId, setEditingDocId] = useState(null);
    const [orderRequirements, setOrderRequirements] = useState([]);
    
    // Filter states
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('0');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocs = async () => {
        try {
            setLoading(true);
            const data = await apiService.getInventoryDocs();
            setDocs(data);
        } catch (error) {
            console.error('Fetch docs error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const filteredDocs = docs.filter(doc => {
        const matchesType = typeFilter === '' || doc.doc_type.toString() === typeFilter;
        const matchesStatus = statusFilter === '' || doc.status.toString() === statusFilter;
        const matchesSearch = doc.doc_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (doc.created_by && doc.created_by.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesStatus && matchesSearch;
    });

    const handleViewDetail = async (docId) => {
        try {
            const data = await apiService.getInventoryDocById(docId);
            setSelectedDoc(data);
            
            if (data.order_ref) {
                const orderData = await apiService.getOrderById(data.order_ref);
                setOrderRequirements(orderData.items || []);
            } else {
                setOrderRequirements([]);
            }
            
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error('View detail error:', error);
        }
    };

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedDoc(null);
        setOrderRequirements([]);
    };

    const getTypeName = (type) => {
        const types = {
            1: 'Nhập kho',
            2: 'Xuất kho',
            3: 'Trả NCC',
            4: 'Nhận BH',
            6: 'NCC Trả BH',
            7: 'Trả BH khách'
        };
        return types[type] || 'Khác';
    };

    const getStatusName = (status) => {
        const statuses = {
            0: 'Chờ duyệt',
            1: 'Đã duyệt',
            2: 'Đã hủy'
        };
        return statuses[status] || 'Không xác định';
    };

    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const handleApprove = async () => {
        if (!selectedDoc) return;
        
        setConfirmConfig({
            isOpen: true,
            title: 'Xác nhận duyệt phiếu',
            message: 'Bạn có chắc chắn muốn DUYỆT phiếu này? Thao tác này sẽ cập nhật tồn kho chính thức.',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await apiService.updateInventoryDocStatus(selectedDoc.doc_id.trim(), 1);
                    handleCloseDetail();
                    fetchDocs();
                    setAlertConfig({
                        isOpen: true,
                        type: 'success',
                        title: 'Thành công',
                        message: 'Duyệt phiếu thành công!'
                    });
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Lỗi',
                        message: error.message
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleCancel = async () => {
        if (!selectedDoc) return;
        
        setConfirmConfig({
            isOpen: true,
            title: 'Xác nhận hủy phiếu',
            message: 'Bạn có chắc chắn muốn HỦY phiếu này? Phiếu sẽ không thể khôi phục sau khi hủy.',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await apiService.updateInventoryDocStatus(selectedDoc.doc_id.trim(), 2);
                    handleCloseDetail();
                    fetchDocs();
                    setAlertConfig({
                        isOpen: true,
                        type: 'success',
                        title: 'Đã hủy',
                        message: 'Hủy phiếu thành công!'
                    });
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Lỗi',
                        message: error.message
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleEdit = () => {
        if (!selectedDoc) return;
        setEditingDocId(selectedDoc.doc_id.trim());
        handleCloseDetail();
        setIsModalOpen(true);
    };

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Quản lý Kho</h2>
                        <p className={styles.subtitle}>Lập và quản lý các chứng từ nhập xuất kho.</p>
                    </div>
                    <button className={styles.addBtn} onClick={() => { setEditingDocId(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Lập phiếu mới
                    </button>
                </header>

                <div className={styles.inventorySection}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.filterGroup}>
                            <div className={styles.searchBox} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}>
                                <Search size={16} className={styles.textMuted} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm mã phiếu, người lập..." 
                                    className={styles.formInput}
                                    style={{border: 'none', background: 'transparent', padding: '0.5rem 0'}}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select 
                                className={styles.filterSelect}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">Tất cả loại phiếu</option>
                                <option value="1">Nhập kho</option>
                                <option value="2">Xuất kho</option>
                                <option value="3">Trả NCC</option>
                            </select>
                            <select 
                                className={styles.filterSelect}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="0">Chờ duyệt</option>
                                <option value="1">Đã duyệt</option>
                                <option value="2">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Mã Phiếu</th>
                                <th className={styles.th}>Loại Phiếu</th>
                                <th className={styles.th}>Người lập</th>
                                <th className={styles.th}>Ngày tạo</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={styles.th}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.td} style={{textAlign: 'center'}}>Đang tải dữ liệu...</td></tr>
                            ) : filteredDocs.length > 0 ? (
                                filteredDocs.map(doc => (
                                    <tr key={doc.doc_id}>
                                        <td className={clsx(styles.td, styles.textBold)}>{doc.doc_id}</td>
                                        <td className={styles.td}>
                                            <span className={clsx(styles.typeBadge, styles[`type${doc.doc_type}`])}>
                                                {getTypeName(doc.doc_type)}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{doc.created_by}</td>
                                        <td className={styles.td}>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className={styles.td}>
                                            <span className={clsx(styles.statusBadge, styles[`status${doc.status}`])}>
                                                {getStatusName(doc.status)}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <button className={styles.actionBtn} onClick={() => handleViewDetail(doc.doc_id.trim())}>
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className={styles.td} style={{textAlign: 'center'}}>Không tìm thấy phiếu kho nào phù hợp.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Create/Edit Document */}
                {isModalOpen && (
                    <DocumentFormModal 
                        isOpen={isModalOpen} 
                        initialDocId={editingDocId}
                        onClose={() => { setIsModalOpen(false); setEditingDocId(null); }} 
                        onSuccess={async () => {
                            const lastId = editingDocId;
                            setIsModalOpen(false);
                            setEditingDocId(null);
                            await fetchDocs();
                            if (lastId) {
                                handleViewDetail(lastId);
                            }
                        }}
                    />
                )}

                {/* Modal View Detail */}
                <Modal 
                    isOpen={isDetailModalOpen} 
                    onClose={handleCloseDetail}
                    title="Chi tiết phiếu kho"
                    width="850px"
                >
                    {selectedDoc && (
                        <div className={styles.modalContent}>
                            <div className={styles.formGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.textMuted}>Mã phiếu: </span>
                                    <span className={styles.textBold}>{selectedDoc.doc_id}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.textMuted}>Loại: </span>
                                    <span className={styles.textBold}>{getTypeName(selectedDoc.doc_type)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.textMuted}>Trạng thái: </span>
                                    <span className={styles.textBold}>{getStatusName(selectedDoc.status)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.textMuted}>Người tạo: </span>
                                    <span className={styles.textBold}>{selectedDoc.created_by}</span>
                                </div>
                                {selectedDoc.order_ref && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.textMuted}>Đơn hàng: </span>
                                        <span className={styles.textBold} style={{color: '#2563eb'}}>#{selectedDoc.order_ref}</span>
                                    </div>
                                )}
                            </div>

                            {orderRequirements.length > 0 && (
                                <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd'}}>
                                    <h4 style={{fontSize: '0.875rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.75rem'}}>Sản phẩm yêu cầu từ đơn hàng:</h4>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem'}}>
                                        {orderRequirements.map(item => {
                                            const scanned = selectedDoc.details?.filter(d => d.product_id === item.product_id).length || 0;
                                            const isDone = scanned === item.quantity;
                                            return (
                                                <div key={item.product_id} style={{padding: '0.75rem', background: 'white', borderRadius: '0.4rem', border: '1px solid #e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                    <div>
                                                        <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{item.product_name}</div>
                                                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>Yêu cầu: {item.quantity}</div>
                                                    </div>
                                                    <div style={{
                                                        padding: '0.25rem 0.6rem', 
                                                        borderRadius: '1rem', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 600,
                                                        background: isDone ? '#ecfdf5' : '#fff7ed',
                                                        color: isDone ? '#059669' : '#d97706',
                                                        border: `1px solid ${isDone ? '#10b981' : '#f59e0b'}`
                                                    }}>
                                                        Đã quét: {scanned}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            <h4 style={{margin: '1.5rem 0 0.75rem 0', fontSize: '1rem', fontWeight: 600}}>Chi tiết thiết bị đã quét ({selectedDoc.details?.length})</h4>
                            <div className={styles.serialList}>
                                {selectedDoc.details?.length > 0 ? (
                                    selectedDoc.details.map(item => (
                                        <div key={item.serial_number} className={styles.serialItem}>
                                            <div className={styles.serialInfo}>
                                                <div className={styles.serialName}>{item.product_name}</div>
                                                <div className={styles.productTag}>Serial: {item.serial_number} - {item.brand}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #e2e8f0'}}>
                                        Chưa có thiết bị nào được quét cho phiếu này.
                                    </div>
                                )}
                            </div>
                            
                            <div className={styles.modalActions}>
                                {selectedDoc.status === 0 && (
                                    <>
                                        <button className={styles.btnPrimary} onClick={handleEdit} style={{background: '#2563eb'}}>Cập nhật phiếu</button>
                                        <button className={styles.btnPrimary} onClick={handleApprove} style={{background: '#059669'}} disabled={orderRequirements.some(item => (selectedDoc.details?.filter(d => d.product_id === item.product_id).length || 0) < item.quantity)}>Duyệt Phiếu</button>
                                        <button className={styles.btnPrimary} onClick={handleCancel} style={{background: '#dc2626'}}>Hủy Phiếu</button>
                                    </>
                                )}
                                <button className={styles.btnSecondary} onClick={handleCloseDetail}>Đóng</button>
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

                <AlertModal 
                    isOpen={confirmConfig.isOpen}
                    onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                    type="warning"
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    onConfirm={() => {
                        setConfirmConfig({ ...confirmConfig, isOpen: false });
                        if (confirmConfig.onConfirm) confirmConfig.onConfirm();
                    }}
                />
            </div>
        </AdminLayout>
    );
};

export default InventoryManagementPage;
