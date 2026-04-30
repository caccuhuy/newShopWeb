import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { apiService } from '../../services/apiService';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.imageSection}>
                        <img src={product.image_url} alt={product.name} className={styles.mainImage} />
                    </div>
                    
                    <div className={styles.infoSection}>
                        <span className={styles.brand}>{product.brand}</span>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.price}>{product.price.toLocaleString()}đ</p>
                        
                        <p className={styles.description}>{product.description}</p>
                        
                        <div className={styles.specs}>
                            <h3 className={styles.specsTitle}>Thông số kỹ thuật</h3>
                            {Object.entries(product.specs).map(([key, value]) => (
                                <div key={key} className={styles.specRow}>
                                    <span className={styles.specLabel}>{key}</span>
                                    <span className={styles.specValue}>{value}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.actions}>
                            <div className={styles.quantitySelector}>
                                <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input type="text" className={styles.qtyInput} value={quantity} readOnly />
                                <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <button 
                                className={styles.addBtn}
                                onClick={() => {
                                    addToCart(product, quantity);
                                    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
                                }}
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetailPage;
