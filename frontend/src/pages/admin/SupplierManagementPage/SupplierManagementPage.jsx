import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import AlertModal from '../../../components/common/Modal/AlertModal';
import { apiService } from '../../../services/apiService';
import { Truck, Plus, Edit, Trash2, Search } from 'lucide-react';
import styles from './SupplierManagementPage.module.css';

const SupplierManagementPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const [form, setForm] = useState({ tax_id: '', supplier_name: '' });

    const loadSuppliers = useCallback(async () => {
        try {
            const data = await apiService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    const handleAdd = () => {
        setEditingSupplier(null);
        setForm({ tax_id: '', supplier_name: '' });
        setShowModal(true);
    };

    const handleEdit = (s) => {
        setEditingSupplier(s);
        setForm({ tax_id: s.tax_id, supplier_name: s.supplier_name });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await apiService.updateSupplier(editingSupplier.tax_id, form.supplier_name);
            } else {
                await apiService.addSupplier(form.tax_id, form.supplier_name);
            }
            setShowModal(false);
            loadSuppliers();
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Lưu nhà cung cấp thành công!' });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    const handleDelete = async (tax_id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
        try {
            await apiService.deleteSupplier(tax_id);
            loadSuppliers();
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Xóa nhà cung cấp thành công!' });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    const filtered = suppliers.filter(s => 
        s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tax_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Quản lý nhà cung cấp</h2>
                        <p className={styles.subtitle}>Quản lý danh sách các đối tác cung ứng hàng hóa.</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={handleAdd}>
                        <Plus size={16} /> Thêm nhà cung cấp
                    </button>
                </header>

                <section className={styles.tableSection}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.searchBox}>
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm theo tên hoặc mã số thuế..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã số thuế</th>
                                <th>Tên nhà cung cấp</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.tax_id}>
                                    <td><span className={styles.taxBadge}>{s.tax_id}</span></td>
                                    <td><span className={styles.textBold}>{s.supplier_name}</span></td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.editBtn} onClick={() => handleEdit(s)}><Edit size={14} /></button>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(s.tax_id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <Modal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)} 
                    title={editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                >
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Mã số thuế</label>
                            <input 
                                type="text" 
                                value={form.tax_id} 
                                onChange={e => setForm({...form, tax_id: e.target.value})} 
                                disabled={!!editingSupplier}
                                required 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên nhà cung cấp</label>
                            <input 
                                type="text" 
                                value={form.supplier_name} 
                                onChange={e => setForm({...form, supplier_name: e.target.value})} 
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn}>{editingSupplier ? 'Cập nhật' : 'Tạo mới'}</button>
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

export default SupplierManagementPage;
