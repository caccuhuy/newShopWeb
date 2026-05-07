import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/common/Header/Header';
import { apiService } from '../../../services/apiService';
import { useCart } from '../../../context/CartContext';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [alertOpen, setAlertOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await apiService.getProductById(id);
                setProduct(data);
            } catch (error) {
                console.error(error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    const safeSpecs = product.specs && typeof product.specs === 'object' ? product.specs : {};
    const formattedPrice = Number(product.price || 0).toLocaleString();
    const imageUrl = product.image_url || 'https://via.placeholder.com/640x480?text=No+Image';

    const renderSpecValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([subKey, subValue]) => `${subKey}: ${renderSpecValue(subValue)}`)
                .join(', ');
        }
        return String(value);
    };

    const renderSpecSection = (title, value) => {
        if (value === null || value === undefined) return null;

        const content = typeof value === 'object' && !Array.isArray(value)
            ? Object.entries(value).map(([subKey, subValue]) => (
                <li key={subKey} className={styles.specItem}>
                    <span className={styles.specItemKey}>{subKey}</span>
                    <span className={styles.specItemValue}>{renderSpecValue(subValue)}</span>
                </li>
            ))
            : (
                <li className={styles.specItem}>
                    <span className={styles.specItemKey}>{title}</span>
                    <span className={styles.specItemValue}>{renderSpecValue(value)}</span>
                </li>
            );

        return (
            <div key={title} className={styles.specSection}>
                <h4 className={styles.specSectionTitle}>{title}</h4>
                <ul className={styles.specItemList}>{content}</ul>
            </div>
        );
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.imagePanel}>
                        <div className={styles.imageSection}>
                            <img src={imageUrl} alt={product.name} className={styles.mainImage} />
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantitySelector}>
                                <button className={styles.qtyBtn} onClick={() => setQuantity((prev) => Math.max(1, Number(prev) - 1))}>-</button>
                                <input
                                    type="number"
                                    min="1"
                                    className={styles.qtyInput}
                                    value={quantity}
                                    onChange={(e) => {
                                        const nextQty = Number(e.target.value);
                                        setQuantity(Number.isNaN(nextQty) || nextQty < 1 ? 1 : nextQty);
                                    }}
                                />
                                <button className={styles.qtyBtn} onClick={() => setQuantity((prev) => Number(prev) + 1)}>+</button>
                            </div>
                            <button
                                className={styles.addBtn}
                                onClick={() => {
                                    addToCart(product, quantity);
                                    setAlertOpen(true);
                                }}
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <span className={styles.brand}>{product.brand || 'Thương hiệu không xác định'}</span>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.price}>{formattedPrice}đ</p>
                        
                        <p className={styles.description}>{product.description || 'Không có mô tả sản phẩm.'}</p>
                        
                        <div className={styles.specs}>
                            <h3 className={styles.specsTitle}>Thông số kỹ thuật</h3>
                            {Object.entries(safeSpecs).length > 0 ? (
                                <div className={styles.specList}>
                                    {Object.entries(safeSpecs).map(([key, value]) => renderSpecSection(key, value))}
                                </div>
                            ) : (
                                <div className={styles.specSection}>
                                    <p className={styles.specItemValue}>Không có thông số</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AlertModal 
                isOpen={alertOpen}
                onClose={() => setAlertOpen(false)}
                type="success"
                title="Giỏ hàng"
                message={`Đã thêm ${quantity} ${product.name} vào giỏ hàng thành công!`}
            />
        </div>
    );
};

export default ProductDetailPage;
