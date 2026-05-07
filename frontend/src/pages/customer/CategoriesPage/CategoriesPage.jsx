import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/common/Header/Header';
import ProductCard from '../../../components/customer/ProductCard/ProductCard';
import { apiService } from '../../../services/apiService';
import styles from './CategoriesPage.module.css';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { categoryName } = useParams();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiService.getCategories();
                setCategories(data);
                
                // If categoryName is provided in URL, load products for that category
                if (categoryName) {
                    const category = data.find(cat => cat.cat_name === categoryName);
                    if (category) {
                        setSelectedCategory(category);
                        await loadCategoryProducts(category.cat_name);
                    }
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [categoryName]);

    const loadCategoryProducts = async (categoryName) => {
        try {
            setLoadingProducts(true);
            const products = await apiService.getProductsByCategory(categoryName);
            setCategoryProducts(products);
        } catch (err) {
            console.error('Error fetching category products:', err);
            setError('Không thể tải sản phẩm của danh mục này.');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setError('');
        navigate(`/categories/${category.cat_name}`);
        await loadCategoryProducts(category.cat_name);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCategoryProducts([]);
        navigate('/categories');
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                {selectedCategory ? (
                    <>
                        <div className={styles.categoryHeader}>
                            <button onClick={handleBackToCategories} className={styles.backButton}>
                                ← Quay lại danh mục
                            </button>
                            <h1 className={styles.title}>{selectedCategory.cat_name}</h1>
                        </div>
                        
                        {loadingProducts ? (
                            <div className={styles.message}>Đang tải sản phẩm...</div>
                        ) : error ? (
                            <div className={styles.error}>{error}</div>
                        ) : categoryProducts.length > 0 ? (
                            <div className={styles.grid}>
                                {categoryProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.message}>Chưa có sản phẩm nào trong danh mục này.</div>
                        )}
                    </>
                ) : (
                    <>
                        <h1 className={styles.title}>Danh mục sản phẩm</h1>
                        {loading && <div className={styles.message}>Đang tải danh mục...</div>}
                        {error && <div className={styles.error}>{error}</div>}
                        {!loading && !error && categories.length === 0 && (
                            <div className={styles.message}>Chưa có danh mục nào.</div>
                        )}
                        {!loading && !error && categories.length > 0 && (
                            <div className={styles.grid}>
                                {categories.map(cat => (
                                    <div 
                                        key={cat.cat_id || cat.id || cat.cat_name} 
                                        className={styles.card}
                                        onClick={() => handleCategoryClick(cat)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3>{cat.cat_name || cat.name}</h3>
                                        <p>{cat.description || ''}</p>
                                        <span className={styles.clickHint}>Nhấn để xem sản phẩm</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default CategoriesPage;
