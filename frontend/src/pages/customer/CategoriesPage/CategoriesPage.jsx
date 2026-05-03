import { useEffect, useState } from 'react';
import Header from '../../../components/common/Header/Header';
import { apiService } from '../../../services/apiService';
import styles from './CategoriesPage.module.css';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiService.getCategories();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <h1 className={styles.title}>Danh mục sản phẩm</h1>
                {loading && <div className={styles.message}>Đang tải danh mục...</div>}
                {error && <div className={styles.error}>{error}</div>}
                {!loading && !error && categories.length === 0 && (
                    <div className={styles.message}>Chưa có danh mục nào.</div>
                )}
                {!loading && !error && categories.length > 0 && (
                    <div className={styles.grid}>
                        {categories.map(cat => (
                            <div key={cat.cat_id || cat.id || cat.cat_name} className={styles.card}>
                                <h3>{cat.cat_name || cat.name}</h3>
                                <p>{cat.description || 'Danh mục sản phẩm'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoriesPage;
