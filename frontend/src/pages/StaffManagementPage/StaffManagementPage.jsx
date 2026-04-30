import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Modal from '../../components/Modal/Modal';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Trash2, RotateCcw, ShieldCheck, UserCog } from 'lucide-react';
import styles from '../AdminPage/AdminPage.module.css';

const StaffManagementPage = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: 'password123', role: 'staff' });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin');
            return;
        }
        loadStaff();
    }, [isAdmin, navigate]);

    const loadStaff = async () => {
        try {
            const users = await apiService.getUsers();
            const filtered = users.filter(u => u.role === 'staff' || u.role === 'admin');
            setStaffList(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (email) => {
        if (email === currentUser.email) {
            alert("Bạn không thể tự xóa tài khoản của chính mình!");
            return;
        }
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${email}?`)) {
            try {
                await apiService.deleteUser(email);
                loadStaff();
                alert('Đã xóa nhân viên thành công.');
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleResetPassword = async (email) => {
        const newPass = prompt("Nhập mật khẩu mới cho nhân viên này:", "123456");
        if (!newPass) return;

        try {
            await apiService.updateUser(email, { password: newPass });
            alert(`Đã reset mật khẩu cho ${email} thành công.`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const users = JSON.parse(localStorage.getItem('mock_users'));
            if (users.find(u => u.email === newStaff.email)) throw new Error('Email này đã tồn tại!');
            
            users.push(newStaff);
            localStorage.setItem('mock_users', JSON.stringify(users));
            
            setShowModal(false);
            setNewStaff({ name: '', email: '', password: 'password123', role: 'staff' });
            loadStaff();
            alert('Thêm nhân viên mới thành công!');
        } catch (error) {
            alert(error.message);
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
                                <th className={styles.th} style={{ textAlign: 'right', paddingRight: '3rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(item => (
                                <tr key={item.email}>
                                    <td className={styles.td}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.iconBox}>
                                                {item.role === 'admin' ? <ShieldCheck size={20} /> : <UserCog size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                                <div className="text-[10px] text-gray-400 font-black">{item.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={item.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeStaff}>
                                            {item.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button 
                                                className={`${styles.miniBtn} ${styles.btnReset}`} 
                                                title="Reset mật khẩu"
                                                onClick={() => handleResetPassword(item.email)}
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                            <button 
                                                className={`${styles.miniBtn} ${styles.btnDelete}`} 
                                                title="Xóa tài khoản"
                                                onClick={() => handleDelete(item.email)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Thêm tài khoản nhân viên mới">
                    <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Họ và tên</label>
                            <input type="text" className={styles.inputField} value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.labelBold}>Email (Dùng để đăng nhập)</label>
                            <input type="email" className={styles.inputField} value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Mật khẩu ban đầu</label>
                                <input type="text" className={styles.inputField} value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.labelBold}>Quyền hạn</label>
                                <select className={styles.selectField} value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                                    <option value="staff">Nhân viên (Staff)</option>
                                    <option value="admin">Quản trị (Admin)</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className={styles.btnPrimary} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Tạo tài khoản</button>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default StaffManagementPage;
