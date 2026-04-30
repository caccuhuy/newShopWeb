import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { History, User } from 'lucide-react';
import styles from '../AdminPage/AdminPage.module.css';
import { clsx } from 'clsx';

const ActivityLogPage = () => {
    const { isAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await apiService.getActivityLogs();
            setLogs(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Nhật ký Hoạt động</h2>
                        <p className={styles.subtitle}>Ghi lại toàn bộ thao tác quan trọng của đội ngũ nhân viên.</p>
                    </div>
                </header>

                <div className={styles.inventorySection}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Dòng thời gian hoạt động</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Thời gian</th>
                                <th className={styles.th}>Nhân viên</th>
                                <th className={styles.th}>Hành động</th>
                                <th className={styles.th}>Loại</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? logs.map(log => (
                                <tr key={log.id}>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textSmall, styles.textBold)}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                        <div className={clsx(styles.textXS, styles.textBlack, styles.textMuted)}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.flexCenter}>
                                            <div className={clsx(styles.iconCircle, "bg-gray-50")} style={{ width: '2rem', height: '2rem', margin: 0 }}>
                                                <User size={14} className={styles.gray400} />
                                            </div>
                                            <div>
                                                <div className={clsx(styles.textSmall, styles.textBold)}>{log.user}</div>
                                                <div className={clsx(styles.textXS, styles.textMuted)}>{log.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <p className={styles.textSmall}>{log.action}</p>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={clsx(styles.stockBadge, log.type === 'danger' ? styles.badgeLow : styles.badgeNormal)}>
                                            {log.type === 'danger' ? 'Cảnh báo' : 'Hệ thống'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className={styles.emptyState}>
                                        <History size={40} className={styles.emptyIcon} />
                                        <p className={clsx(styles.textMuted, styles.textBold)}>Chưa có hoạt động nào được ghi nhận</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ActivityLogPage;
