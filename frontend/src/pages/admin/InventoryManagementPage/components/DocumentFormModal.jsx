import { useState, useEffect } from 'react';
import Modal from '../../../../components/common/Modal/Modal';
import { apiService } from '../../../../services/apiService';
import { Search, X, Scan, Zap, Trash2, CheckCircle2, Circle } from 'lucide-react';
import styles from '../InventoryManagementPage.module.css';

const SerialPickerModal = ({ isOpen, onClose, product, availableSerials, alreadySelected, onConfirm, maxNeeded }) => {
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSelected(alreadySelected.map(s => s.serial_number));
        }
    }, [isOpen, alreadySelected]);

    const toggleSerial = (sn) => {
        if (selected.includes(sn)) {
            setSelected(selected.filter(s => s !== sn));
        } else {
            if (selected.length < maxNeeded) {
                setSelected([...selected, sn]);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chọn Serial cho ${product?.product_name}`} width="600px">
            <div style={{padding: '1rem'}}>
                <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '0.875rem', color: '#64748b'}}>Đã chọn: {selected.length} / {maxNeeded}</span>
                    <button 
                        className={styles.btnPrimary} 
                        style={{padding: '0.4rem 1rem', fontSize: '0.875rem'}}
                        onClick={() => onConfirm(selected)}
                    >
                        Xác nhận
                    </button>
                </div>
                <div style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem'}}>
                    {availableSerials.length > 0 ? (
                        availableSerials.map(sn => (
                            <div 
                                key={sn} 
                                onClick={() => toggleSerial(sn)}
                                style={{
                                    padding: '0.75rem 1rem', 
                                    borderBottom: '1px solid #f1f5f9', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    background: selected.includes(sn) ? '#f0f9ff' : 'white'
                                }}
                            >
                                {selected.includes(sn) ? <CheckCircle2 size={18} color="#0369a1" /> : <Circle size={18} color="#cbd5e1" />}
                                <span style={{fontSize: '0.875rem', fontWeight: 500}}>{sn}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>Không còn Serial khả dụng trong kho.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const DocumentFormModal = ({ isOpen, onClose, onSuccess, initialDocId = null }) => {
    const [docData, setDocData] = useState({
        doc_id: '',
        doc_type: 1, // Nhập kho
        Suppliers_tax_id: '',
        order_ref: '',
        Doc_description: '',
        details: []
    });

    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]); // Required items for selected order
    const [stockStatus, setStockStatus] = useState([]); // Available stock for those items
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Product selector states (for Imports)
    const [allProducts, setAllProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    // Picker states
    const [pickerState, setPickerState] = useState({ isOpen: false, product: null });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [suppliersData, ordersData, productsData] = await Promise.all([
                    apiService.getSuppliers(),
                    apiService.getOrders(),
                    apiService.getProducts()
                ]);
                setSuppliers(suppliersData);
                setOrders(ordersData.filter(o => o.status === 'processing'));
                setAllProducts(productsData);
                
                // Extract unique brands
                const uniqueBrands = [...new Set(productsData.map(p => p.brand))].filter(Boolean).sort();
                setBrands(uniqueBrands);

                if (initialDocId) {
                    const existingDoc = await apiService.getInventoryDocById(initialDocId);
                    setDocData({
                        doc_id: existingDoc.doc_id,
                        doc_type: existingDoc.doc_type,
                        Suppliers_tax_id: existingDoc.Suppliers_tax_id || '',
                        order_ref: existingDoc.order_ref || '',
                        Doc_description: existingDoc.Doc_description || '',
                        details: existingDoc.details || []
                    });
                } else {
                    setDocData({
                        doc_id: '',
                        doc_type: 1,
                        Suppliers_tax_id: '',
                        order_ref: '',
                        Doc_description: '',
                        details: []
                    });
                }
            } catch (err) {
                console.error('Load initial data error:', err);
            }
        };
        if (isOpen) loadInitialData();
    }, [isOpen, initialDocId]);

    // Load order details when order_ref changes
    useEffect(() => {
        if (docData.doc_type === 2 && docData.order_ref) {
            const loadOrderInfo = async () => {
                try {
                    const [details, stock] = await Promise.all([
                        apiService.getOrderById(docData.order_ref),
                        apiService.checkOrderStock(docData.order_ref)
                    ]);
                    setOrderItems(details.items);
                    setStockStatus(stock);
                } catch (err) {
                    console.error('Load order info error:', err);
                }
            };
            loadOrderInfo();
        } else {
            setOrderItems([]);
            setStockStatus([]);
        }
    }, [docData.order_ref, docData.doc_type]);

    const handleAutoFill = () => {
        if (!orderItems.length || !stockStatus.length) return;

        const newDetails = [...docData.details];
        
        orderItems.forEach(item => {
            const stock = stockStatus.find(s => s.product_id === item.product_id);
            if (!stock) return;

            const alreadyScannedCount = newDetails.filter(d => d.product_id === item.product_id).length;
            const needed = item.quantity - alreadyScannedCount;

            if (needed > 0) {
                const currentSns = newDetails.map(d => d.serial_number);
                const availableSns = stock.available_serials.filter(sn => !currentSns.includes(sn));
                
                const toAdd = availableSns.slice(0, needed);
                toAdd.forEach(sn => {
                    newDetails.push({
                        serial_number: sn,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        unit_price: item.price_at_time || item.unit_price || 0
                    });
                });
            }
        });

        setDocData({ ...docData, details: newDetails });
    };

    const filteredProducts = allProducts.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(productSearch.toLowerCase());
        const matchesBrand = !selectedBrand || p.brand === selectedBrand;
        return matchesSearch && matchesBrand;
    }).slice(0, 10);

    const [importQuantities, setImportQuantities] = useState({});

    const handleAddImportItem = (product) => {
        const productId = product.product_id || product.id;
        const qty = parseInt(importQuantities[productId]) || 1;
        const newItems = [];
        
        for (let i = 0; i < qty; i++) {
            const serial = `SN-NEW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            newItems.push({
                serial_number: serial,
                product_id: productId,
                product_name: product.product_name,
                unit_price: product.price || 0
            });
        }

        setDocData({
            ...docData,
            details: [...newItems, ...docData.details]
        });
        
        // Reset quantity for this product
        setImportQuantities({ ...importQuantities, [productId]: 1 });
    };

    const handlePickerConfirm = (selectedSns) => {
        const productId = pickerState.product.product_id;
        const otherProductDetails = docData.details.filter(d => d.product_id !== productId);
        
        const newDetailsForProduct = selectedSns.map(sn => ({
            serial_number: sn,
            product_id: productId,
            product_name: pickerState.product.product_name,
            unit_price: pickerState.product.price_at_time || pickerState.product.unit_price || 0
        }));

        setDocData({
            ...docData,
            details: [...otherProductDetails, ...newDetailsForProduct]
        });
        setPickerState({ isOpen: false, product: null });
    };

    const removeDetail = (sn) => {
        setDocData({
            ...docData,
            details: docData.details.filter(d => d.serial_number !== sn)
        });
    };

    const handleSubmit = async () => {
        if (docData.details.length === 0) {
            setError('Vui lòng thêm ít nhất một sản phẩm.');
            return;
        }

        try {
            setLoading(true);
            if (initialDocId) {
                await apiService.updateInventoryDocDetails(initialDocId, docData.details);
            } else {
                const prefix = docData.doc_type === 1 ? 'IM-' : docData.doc_type === 2 ? 'EX-' : 'DC-';
                const random = Math.random().toString(36).substring(7).toUpperCase();
                const finalDocId = (prefix + random).substring(0, 10);
                
                await apiService.createInventoryDoc({
                    ...docData,
                    doc_id: finalDocId
                });
            }
            onSuccess();
        } catch (err) {
            setError(err.message || 'Lỗi khi lưu phiếu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                title={initialDocId ? `Cập nhật phiếu ${initialDocId}` : "Lập phiếu kho mới"} 
                width="950px"
            >
                <div className={styles.modalContent}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Loại phiếu</label>
                            <select 
                                className={styles.formSelect}
                                value={docData.doc_type}
                                disabled={!!initialDocId}
                                onChange={(e) => setDocData({...docData, doc_type: parseInt(e.target.value), details: [], order_ref: '', Suppliers_tax_id: ''})}
                            >
                                <option value={1}>Nhập kho (Goods Receipt)</option>
                                <option value={2}>Xuất kho (Goods Issue)</option>
                                <option value={3}>Trả Nhà cung cấp</option>
                            </select>
                        </div>

                        {docData.doc_type === 1 ? (
                            <div className={styles.formGroup}>
                                <label>Nhà cung cấp</label>
                                <select 
                                    className={styles.formSelect}
                                    value={docData.Suppliers_tax_id}
                                    disabled={!!initialDocId}
                                    onChange={(e) => setDocData({...docData, Suppliers_tax_id: e.target.value})}
                                >
                                    <option value="">Chọn nhà cung cấp</option>
                                    {suppliers.map(s => (
                                        <option key={s.tax_id} value={s.tax_id}>{s.supplier_name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <label>Đơn hàng liên quan (Chờ xuất)</label>
                                <select 
                                    className={styles.formSelect}
                                    value={docData.order_ref}
                                    disabled={!!initialDocId}
                                    onChange={(e) => setDocData({...docData, order_ref: e.target.value, details: []})}
                                >
                                    <option value="">Chọn đơn hàng</option>
                                    {orders.map(o => (
                                        <option key={o.id} value={o.id}>#{o.id} - {o.customer_info?.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Product Selector for Imports */}
                    {docData.doc_type === 1 && (
                        <div style={{background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
                            <h5 style={{fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem'}}>Tìm sản phẩm để nhập kho:</h5>
                            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                                <div style={{flex: 1, position: 'relative'}}>
                                    <Search style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} size={18} />
                                    <input 
                                        type="text" 
                                        className={styles.formInput} 
                                        style={{paddingLeft: '2.5rem'}}
                                        placeholder="Tìm theo tên sản phẩm..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className={styles.formSelect} 
                                    style={{width: '200px'}}
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                >
                                    <option value="">Tất cả thương hiệu</option>
                                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem'}}>
                                {productSearch || selectedBrand ? (
                                    filteredProducts.map(p => (
                                        <div key={p.product_id || p.id} style={{
                                            background: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div style={{overflow: 'hidden'}}>
                                                <div style={{fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.product_name}</div>
                                                <div style={{fontSize: '0.75rem', color: '#64748b'}}>{p.brand} | {p.category}</div>
                                            </div>
                                            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={importQuantities[p.product_id || p.id] || 1}
                                                    onChange={(e) => setImportQuantities({...importQuantities, [p.product_id || p.id]: e.target.value})}
                                                    style={{
                                                        width: '50px', 
                                                        padding: '0.25rem', 
                                                        border: '1px solid #cbd5e1', 
                                                        borderRadius: '0.25rem',
                                                        fontSize: '0.875rem',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                                <button 
                                                    className={styles.btnPrimary} 
                                                    style={{padding: '0.3rem 0.75rem', fontSize: '0.75rem'}}
                                                    onClick={() => handleAddImportItem(p)}
                                                >
                                                    Thêm
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic'}}>
                                        Nhập tên hoặc chọn thương hiệu để tìm sản phẩm
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {orderItems.length > 0 && (
                        <div className={styles.orderRequirements} style={{marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                                <h5 style={{fontSize: '0.95rem', fontWeight: 600, color: '#1e293b'}}>Sản phẩm yêu cầu từ đơn hàng #{docData.order_ref}:</h5>
                                <button className={styles.autoFillBtn} onClick={handleAutoFill}>
                                    <Zap size={14} style={{marginRight: '0.4rem'}} /> Auto Fill nhanh
                                </button>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
                                {orderItems.map(item => {
                                    const scanned = docData.details.filter(d => d.product_id === item.product_id).length;
                                    const isDone = scanned === item.quantity;
                                    return (
                                        <div key={item.product_id} style={{
                                            padding: '0.75rem', 
                                            background: 'white', 
                                            borderRadius: '0.5rem', 
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{item.product_name}</div>
                                                <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem'}}>
                                                    Yêu cầu: {item.quantity} | <span style={{color: isDone ? '#059669' : '#d97706', fontWeight: 600}}>Đã chọn: {scanned}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className={styles.btnPrimary} 
                                                style={{padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: isDone ? '#059669' : '#2563eb'}}
                                                onClick={() => setPickerState({ isOpen: true, product: item })}
                                            >
                                                {isDone ? 'Sửa Serial' : 'Chọn Serial'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    <div style={{marginTop: '1.5rem'}}>
                        <h4 style={{fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem'}}>Danh sách sản phẩm trong phiếu ({docData.details.length})</h4>
                        
                        <div className={styles.serialList} style={{maxHeight: '400px', overflowY: 'auto', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '0.5rem'}}>
                            {docData.details.length > 0 ? (
                                docData.details.map((item, index) => (
                                    <div key={item.serial_number} className={styles.serialItem} style={{background: 'white', margin: '0.5rem', border: '1px solid #f1f5f9'}}>
                                        <div className={styles.serialInfo}>
                                            <div className={styles.serialName}>{item.product_name}</div>
                                            <div className={styles.productTag}>Serial: {item.serial_number}</div>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <button className={styles.removeBtn} onClick={() => removeDetail(item.serial_number)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem'}}>
                                    Chưa có sản phẩm nào được chọn. {docData.doc_type === 2 && 'Vui lòng sử dụng các nút "Chọn Serial" ở trên.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <p className={styles.statusError} style={{marginTop: '1rem'}}>{error}</p>}

                    <div className={styles.modalActions}>
                        <button className={styles.btnSecondary} onClick={onClose}>Hủy bỏ</button>
                        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading || docData.details.length === 0}>
                            {loading ? 'Đang lưu...' : initialDocId ? 'Cập nhật Phiếu' : 'Lưu Phiếu Nháp'}
                        </button>
                    </div>
                </div>
            </Modal>

            {pickerState.isOpen && (
                <SerialPickerModal 
                    isOpen={pickerState.isOpen}
                    onClose={() => setPickerState({ isOpen: false, product: null })}
                    product={pickerState.product}
                    availableSerials={stockStatus.find(s => s.product_id === pickerState.product?.product_id)?.available_serials || []}
                    alreadySelected={docData.details.filter(d => d.product_id === pickerState.product?.product_id)}
                    maxNeeded={pickerState.product?.quantity || 0}
                    onConfirm={handlePickerConfirm}
                />
            )}
        </>
    );
};

export default DocumentFormModal;
