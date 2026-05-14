import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../../components/common/Header/Header';
import ProductCard from '../../../components/customer/ProductCard/ProductCard';
import { apiService } from '../../../services/apiService';
import styles from './HomePage.module.css';
import { clsx } from 'clsx';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterPrice, setFilterPrice] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodData, catData] = await Promise.all([
                    apiService.getProducts(),
                    apiService.getCategories()
                ]);
                setProducts(prodData);
                setCategories(catData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const brands = [...new Set(products.map(p => p.brand))].filter(Boolean).sort();

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                              (p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        const matchesBrand = filterBrand === '' || p.brand === filterBrand;
        const matchesCategory = filterCategory === '' || p.cat_id?.toString() === filterCategory;
        
        let matchesPrice = true;
        if (filterPrice === 'under10m') matchesPrice = p.price < 10000000;
        else if (filterPrice === '10m-20m') matchesPrice = p.price >= 10000000 && p.price <= 20000000;
        else if (filterPrice === '20m-30m') matchesPrice = p.price > 20000000 && p.price <= 30000000;
        else if (filterPrice === 'over30m') matchesPrice = p.price > 30000000;

        return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
    });

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
                    <div className={styles.titleWithFilters}>
                        <h2 className={styles.sectionTitle}>
                            {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Sản Phẩm Bán Chạy'}
                        </h2>
                        
                        {!loading && products.length > 0 && (
                            <div className={styles.filterSection}>
                                <select 
                                    className={styles.filterSelect}
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map(c => <option key={c.cat_id} value={c.cat_id.toString()}>{c.cat_name}</option>)}
                                </select>

                                <select 
                                    className={styles.filterSelect}
                                    value={filterBrand}
                                    onChange={(e) => setFilterBrand(e.target.value)}
                                >
                                    <option value="">Tất cả thương hiệu</option>
                                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                
                                <select 
                                    className={styles.filterSelect}
                                    value={filterPrice}
                                    onChange={(e) => setFilterPrice(e.target.value)}
                                >
                                    <option value="">Mọi mức giá</option>
                                    <option value="under10m">Dưới 10 triệu</option>
                                    <option value="10m-20m">Từ 10 - 20 triệu</option>
                                    <option value="20m-30m">Từ 20 - 30 triệu</option>
                                    <option value="over30m">Trên 30 triệu</option>
                                </select>
                            </div>
                        )}
                    </div>
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
                            {searchQuery ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm.' : 'Không có sản phẩm nào.'}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
