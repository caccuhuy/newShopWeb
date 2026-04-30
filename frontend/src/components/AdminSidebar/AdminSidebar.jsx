import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, FolderOpen, Package, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                {isAdmin && (
                    <NavLink to="/admin/staff" className={({ isActive }) => isActive ? `${styles.navBtn} ${styles.activeBtn}` : styles.navBtn}>
                        <Users size={18} /> <span>Quản lý nhân viên</span>
                    </NavLink>
                )}
                <button className={styles.navBtn}>
                    <FolderOpen size={18} /> <span>Suppliers</span>
                </button>
                <button className={styles.navBtn}>
                    <Package size={18} /> <span>Stock</span>
                </button>
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}></div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>{user?.name || 'Staff Member'}</p>
                        <p className={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Staff Level'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={14} className="inline mr-2" /> LOGOUT
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
