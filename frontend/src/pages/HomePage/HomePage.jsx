import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import ProductCard from '../../components/ProductCard/ProductCard';
import { apiService } from '../../services/apiService';
import styles from './HomePage.module.css';
import { clsx } from 'clsx';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiService.getProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

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
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className={styles.sectionTitle}>
                        {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Sản Phẩm Bán Chạy'}
                    </h2>
                    {loading ? (
                        <div className="text-center py-10">Đang tải sản phẩm...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={styles.grid}>
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            Không tìm thấy sản phẩm nào phù hợp.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
