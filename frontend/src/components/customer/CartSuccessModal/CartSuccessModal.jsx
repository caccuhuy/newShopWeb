import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './CartSuccessModal.module.css';

const CartSuccessModal = ({ isOpen, onClose, product }) => {
    const navigate = useNavigate();

    if (!isOpen || !product) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.successIconWrapper}>
                        <CheckCircle2 className={styles.successIcon} size={28} />
                    </div>
                    <h2 className={styles.title}>Đã thêm vào giỏ hàng!</h2>
                </div>

                <div className={styles.productInfo}>
                    <div className={styles.imageWrapper}>
                        <img src={product.image_url} alt={product.name} className={styles.image} />
                    </div>
                    <div className={styles.details}>
                        <h3 className={styles.name}>{product.name}</h3>
                        <p className={styles.price}>{(product.price || 0).toLocaleString()}đ</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.continueBtn} onClick={onClose}>
                        Tiếp tục mua sắm
                    </button>
                    <button className={styles.cartBtn} onClick={() => {
                        onClose();
                        navigate('/cart');
                    }}>
                        Xem giỏ hàng <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartSuccessModal;
