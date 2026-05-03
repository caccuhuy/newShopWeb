import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    };

    return (
        <div className={styles.card} onClick={() => navigate(`/product/${product.id}`)}>
            <div className={styles.imageWrapper}>
                <img src={product.image_url} alt={product.name} className={styles.image} />
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
