import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { History, User } from 'lucide-react';
import styles from "./ActivityLogPage.module.css";
import { clsx } from 'clsx';

const ActivityLogPage = () => {
    const { isAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState("");

    const fetchData = useCallback(async () => {
        if (!isAdmin) return;
        try {
            setLoading(true);
            const data = await apiService.getActivityLogs();
            if (Array.isArray(data)) {
                setLogs(data.sort((a, b) => b.log_id - a.log_id));
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredLogs = logs.filter(log => {
        if (!filterDate) return true;
        // Adjust for timezone to match local date string from YYYY-MM-DD input
        const logDateObj = new Date(log.timestamp);
        const logDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        return logDateStr === filterDate;
    });

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Nhật ký Hoạt động</h2>
                        <p className={styles.subtitle}>Ghi lại toàn bộ thao tác quan trọng của đội ngũ nhân viên.</p>
                    </div>
                    <button 
                        className={styles.refreshBtn} 
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <History size={16} className={loading ? styles.spin : ""} />
                        {loading ? 'Đang cập nhật...' : 'Làm mới'}
                    </button>
                </header>

                <div className={styles.inventorySection}>
                    <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Dòng thời gian hoạt động</h3>
                        <div className={styles.flexCenter}>
                            <span className={styles.textXS}>Lọc theo ngày:</span>
                            <input 
                                type="date" 
                                className={styles.dateInput} 
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            {filterDate && (
                                <button 
                                    className={styles.textXS} 
                                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => setFilterDate("")}
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>
                    </div>
                    {error ? (
                        <div className={styles.emptyState}>
                            <p className={clsx(styles.textMuted, styles.textBold)}>Lỗi: {error}</p>
                            <button onClick={fetchData} className={styles.refreshBtn} style={{ margin: '1rem auto' }}>Thử lại</button>
                        </div>
                    ) : loading ? (
                        <div className={styles.emptyState}>
                            <p className={clsx(styles.textMuted, styles.textBold)}>Đang tải nhật ký...</p>
                        </div>
                    ) : (
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
                            {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                                <tr key={log.log_id || index}>
                                    <td className={styles.td}>
                                        <div className={clsx(styles.textSmall, styles.textBold)}>{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</div>
                                        <div className={clsx(styles.textXS, styles.textMuted)}>{new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.flexCenter}>
                                            <div className={styles.iconCircle} style={{ width: '2rem', height: '2rem' }}>
                                                <User size={14} className={styles.textMuted} />
                                            </div>
                                            <div>
                                                <div className={clsx(styles.textSmall, styles.textBold)}>{log.user || 'Hệ thống'}</div>
                                                <div className={clsx(styles.textXS, styles.textMuted)}>{log.email || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <p className={styles.textSmall}>{log.action}</p>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={clsx(
                                            styles.badge,
                                            log.type === 'success' && styles.badgeSuccess,
                                            log.type === 'warning' && styles.badgeWarning,
                                            log.type === 'danger' && styles.badgeDanger,
                                            (log.type === 'info' || !log.type) && styles.badgeInfo
                                        )}>
                                            {log.type === 'danger' ? 'Cảnh báo' : (log.type === 'success' ? 'Thành công' : (log.type === 'warning' ? 'Lưu ý' : 'Thông tin'))}
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
                )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ActivityLogPage;
