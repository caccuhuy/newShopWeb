import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { UserPlus, Lock, Unlock, RotateCcw, ShieldCheck, UserCog, KeyRound, AlertTriangle } from 'lucide-react';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from "./StaffManagementPage.module.css";
import { clsx } from 'clsx';

const StaffManagementPage = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    
    // New states for confirm and password modals
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [newPassword, setNewPassword] = useState('123456');

    const [newStaff, setNewStaff] = useState({ name: '', email: '', phone_number: '', role: 'Staff' });

    const loadStaff = useCallback(async () => {
        try {
            const data = await apiService.getStaffList();
            setStaffList(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin');
            return;
        }
        loadStaff();
    }, [isAdmin, navigate, loadStaff]);

    const handleToggleStatus = (staff) => {
        setSelectedStaff(staff);
        setShowStatusModal(true);
    };

    const confirmToggleStatus = async () => {
        const action = !selectedStaff.is_active ? 'mở khóa' : 'khóa';
        try {
            await apiService.updateStaffStatus(selectedStaff.user_id, !selectedStaff.is_active);
            setShowStatusModal(false);
            loadStaff();
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: `Đã ${action} tài khoản thành công.`
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

    const handleResetPassword = (staff) => {
        setSelectedStaff(staff);
        setNewPassword('123456');
        setShowPasswordModal(true);
    };

    const confirmResetPassword = async (e) => {
        e.preventDefault();
        try {
            await apiService.resetStaffPassword(selectedStaff.user_id, newPassword);
            setShowPasswordModal(false);
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: `Đã reset mật khẩu cho ${selectedStaff.username} thành công.`
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

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await apiService.createStaff(newStaff);
            setShowModal(false);
            setNewStaff({ name: '', email: '', phone_number: '', role: 'Staff' });
            loadStaff();
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: 'Thêm nhân viên mới thành công!'
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

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Quản lý nhân viên</h2>
                        <p className={styles.subtitle}>Danh sách tài khoản có quyền truy cập vào hệ thống quản trị.</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
                        <UserPlus size={16} className="inline mr-2" /> Thêm nhân viên
                    </button>
                </header>

                <section className={styles.inventorySection}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Danh sách tài khoản</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Nhân viên</th>
                                <th className={styles.th}>Quyền hạn</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={styles.th} style={{ textAlign: 'right', paddingRight: '3rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(item => (
                                <tr key={item.user_id}>
                                    <td className={styles.td}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.iconBox}>
                                                {item.role_name === 'Admin' ? <ShieldCheck size={20} /> : <UserCog size={20} />}
                                            </div>
                                            <div>
                                                <div className={clsx(styles.textBold, styles.textSmall)}>{item.username}</div>
                                                <div className={clsx(styles.textXS, styles.textMuted, styles.textBlack)}>{item.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={item.role_name === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeStaff}>
                                            {item.role_name === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={item.is_active ? styles.statusActive : styles.statusLocked}>
                                            {item.is_active ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button 
                                                className={clsx(styles.miniBtn, styles.btnReset)} 
                                                title="Reset mật khẩu"
                                                onClick={() => handleResetPassword(item)}
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                            <button 
                                                className={clsx(styles.miniBtn, item.is_active ? styles.btnDelete : styles.btnUnlock)} 
                                                title={item.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                onClick={() => handleToggleStatus(item)}
                                            >
                                                {item.is_active ? <Lock size={12} /> : <Unlock size={12} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Thêm tài khoản nhân viên mới">
                    <form onSubmit={handleAddStaff} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Họ và tên</label>
                            <input type="text" className={styles.inputField} value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Email (Dùng để đăng nhập)</label>
                            <input type="email" className={styles.inputField} value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                        </div>
                        <div className={styles.formGrid2}>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Số điện thoại</label>
                                <input type="text" className={styles.inputField} value={newStaff.phone_number} onChange={e => setNewStaff({...newStaff, phone_number: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Quyền hạn</label>
                                <select className={styles.selectField} value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                                    <option value="Staff">Nhân viên (Staff)</option>
                                    <option value="Admin">Quản trị (Admin)</option>
                                </select>
                            </div>
                        </div>
                        <p className={styles.textMuted} style={{ fontSize: '11px', marginBottom: '1rem' }}>* Mật khẩu mặc định sau khi tạo sẽ là: <strong>123456</strong></p>
                        <button type="submit" className={clsx(styles.btnPrimary, styles.btnFull)}>Tạo tài khoản</button>
                    </form>
                </Modal>

                {/* Modal xác nhận Khóa/Mở khóa */}
                <Modal 
                    isOpen={showStatusModal} 
                    onClose={() => setShowStatusModal(false)} 
                    title="Xác nhận thay đổi"
                    size="sm"
                    footer={
                        <>
                            <button className={styles.btnSecondary} onClick={() => setShowStatusModal(false)}>Hủy</button>
                            <button 
                                className={clsx(styles.btnPrimary, selectedStaff?.is_active ? styles.btnDanger : styles.btnSuccess)}
                                onClick={confirmToggleStatus}
                            >
                                {selectedStaff?.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                            </button>
                        </>
                    }
                >
                    <div className={styles.confirmContent}>
                        <div className={clsx(styles.alertIcon, selectedStaff?.is_active ? styles.alertRed : styles.alertGreen)}>
                            <AlertTriangle size={32} />
                        </div>
                        <p className={styles.confirmText}>
                            Bạn có chắc chắn muốn <strong>{selectedStaff?.is_active ? 'khóa' : 'mở khóa'}</strong> tài khoản của <strong>{selectedStaff?.username}</strong>?
                        </p>
                        {selectedStaff?.is_active && (
                            <p className={styles.textXS} style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                                * Nhân viên này sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.
                            </p>
                        )}
                    </div>
                </Modal>

                {/* Modal Reset Mật khẩu */}
                <Modal 
                    isOpen={showPasswordModal} 
                    onClose={() => setShowPasswordModal(false)} 
                    title="Reset mật khẩu nhân viên"
                    size="sm"
                >
                    <form onSubmit={confirmResetPassword} className={styles.form}>
                        <div className={styles.confirmContent} style={{ marginBottom: '1.5rem' }}>
                            <div className={clsx(styles.alertIcon, styles.alertBlue)}>
                                <KeyRound size={32} />
                            </div>
                            <p className={styles.confirmText}>
                                Đang thiết lập lại mật khẩu cho: <br/><strong>{selectedStaff?.username}</strong>
                            </p>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Mật khẩu mới</label>
                            <input 
                                type="text" 
                                className={styles.inputField} 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className={styles.rowActions} style={{ marginTop: '1rem' }}>
                            <button type="button" className={styles.btnSecondary} onClick={() => setShowPasswordModal(false)}>Hủy</button>
                            <button type="submit" className={styles.btnPrimary}>Cập nhật mật khẩu</button>
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

export default StaffManagementPage;
