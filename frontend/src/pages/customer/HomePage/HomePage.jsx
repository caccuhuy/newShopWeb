import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../../components/common/Header/Header';
import ProductCard from '../../../components/customer/ProductCard/ProductCard';
import { apiService } from '../../../services/apiService';
import styles from './HomePage.module.css';
import { clsx } from 'clsx';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiService.getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );

    return (
        <div className={styles.wrapper}>
            <Header />
            
            {!searchQuery && (
                <section className={styles.hero}>
                    <div className={styles.heroContainer}>
                        <div className={styles.heroContent}>
                            <span className={styles.collectionBadge}>Collection 2026</span>
                            <h1 className={styles.heroTitle}>
                                Mua sắm tẹt ga, <br />
                                <span className={styles.heroTitleHighlight}>không lo về giá</span>
                            </h1>
                            <p className={styles.heroDescription}>
                                Khám phá hàng ngàn sản phẩm công nghệ mới nhất với mức giá hấp dẫn và nhiều ưu đãi đặc biệt.
                            </p>
                        </div>
                        <div className={styles.heroImageWrapper}>
                            <img 
                                src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1000" 
                                alt="Hero Tech" 
                                className={styles.heroImage}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section className={clsx(styles.productSection, searchQuery && styles.productSectionSearch)}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>
                        {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Sản Phẩm Bán Chạy'}
                    </h2>
                    {loading ? (
                        <div className={styles.loading}>Đang tải sản phẩm...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={styles.grid}>
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id || index} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            Không tìm thấy sản phẩm nào phù hợp.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
