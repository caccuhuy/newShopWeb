import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './ProductCard.module.css';
import { Image as ImageIcon } from 'lucide-react';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div className={styles.card} onClick={() => navigate(`/product/${product.id}`)}>
            <div className={styles.imageWrapper}>
                {product.image_url ? (
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className={styles.image} 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add(styles.showPlaceholder);
                        }}
                    />
                ) : null}
                <div className={styles.placeholder}>
                    <ImageIcon size={40} className={styles.placeholderIcon} />
                </div>
            </div>
            <div className={styles.info}>
                <span className={styles.brand}>{product.brand}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <span className={styles.price}>{(product.price || 0).toLocaleString()}đ</span>
            </div>
            <div className={styles.footer}>
                <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
