import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
