import AdminSidebar from '../AdminSidebar/AdminSidebar';
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
