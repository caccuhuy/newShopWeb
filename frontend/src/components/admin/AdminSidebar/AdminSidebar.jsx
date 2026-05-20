import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BarChart3, FolderOpen, Package, LogOut, Users, ClipboardList, History, Boxes, Key } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import Modal from '../../common/Modal/Modal';
import AlertModal from '../../common/Modal/AlertModal';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPass !== passwords.confirm) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Mật khẩu mới không khớp' });
            return;
        }
        try {
            await apiService.changeStaffPassword(passwords.current, passwords.newPass);
            setShowPasswordModal(false);
            setPasswords({ current: '', newPass: '', confirm: '' });
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Đổi mật khẩu thành công!' });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Console</h1>
                <p className={styles.subtitle}>Inventory Control</p>
            </div>

            <nav className={styles.nav}>
                <NavLink to="/admin" end className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                    <BarChart3 size={18} /> <span>Reports</span>
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                    <ClipboardList size={18} /> <span>Đơn hàng</span>
                </NavLink>
                <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                    <Boxes size={18} /> <span>Quản lý Kho</span>
                </NavLink>
                {isAdmin && (
                    <>
                        <NavLink to="/admin/staff" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                            <Users size={18} /> <span>Quản lý nhân viên</span>
                        </NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                            <Package size={18} /> <span>Quản lý sản phẩm</span>
                        </NavLink>
                        <NavLink to="/admin/suppliers" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                            <FolderOpen size={18} /> <span>Nhà cung cấp</span>
                        </NavLink>
                        <NavLink to="/admin/logs" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                            <History size={18} /> <span>Nhật ký</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}></div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>{user?.name || 'Staff Member'}</p>
                        <p className={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Staff Level'}</p>
                    </div>
                </div>
                <button onClick={() => setShowPasswordModal(true)} className={styles.settingsBtn}>
                    <Key size={14} className={styles.mr2} /> ĐỔI MẬT KHẨU
                </button>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={14} className={styles.mr2} /> LOGOUT
                </button>
            </div>

            {/* Modal Đổi mật khẩu */}
            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu" size="sm">
                <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mật khẩu hiện tại</label>
                        <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mật khẩu mới</label>
                        <input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Xác nhận mật khẩu mới</label>
                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowPasswordModal(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
                        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cập nhật</button>
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
        </aside>
    );
};

export default AdminSidebar;
