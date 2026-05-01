import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/common/Header/Header';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import AlertModal from '../../../components/common/Modal/AlertModal';
import styles from './CheckoutPage.module.css';

const CheckoutPage = () => {
    const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        
        setLoading(true);
        try {
            await apiService.createOrder({
                user_id: user?.id,
                items: cart,
                total_amount: cartTotal,
                shipping_address: formData.address,
                customer_info: formData
            });
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Đặt hàng thành công',
                message: 'Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ sớm nhất!'
            });
            clearCart();
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi đặt hàng',
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setAlertConfig({ ...alertConfig, isOpen: false });
        if (alertConfig.type === 'success') {
            navigate('/');
        }
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <h1 className={styles.title}>Giỏ hàng của bạn</h1>
                
                {cart.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <p>Giỏ hàng đang trống.</p>
                        <Link to="/" className={styles.shopLink}>Tiếp tục mua sắm →</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        <div className={styles.cartSection}>
                            {cart.map(item => (
                                <div key={item.id} className={styles.cartItem}>
                                    <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemBrand}>{item.brand}</span>
                                        <h3 className={styles.itemName}>{item.name}</h3>
                                        <p className={styles.itemPrice}>{item.price.toLocaleString()}đ</p>
                                        
                                        <div className={styles.itemActions}>
                                            <div className={styles.qtyControls}>
                                                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.orderSection}>
                            <h2 className={styles.orderTitle}>Tóm tắt đơn hàng</h2>
                            <div className={styles.summaryRow}>
                                <span>Tạm tính ({cart.length} món)</span>
                                <span>{cartTotal.toLocaleString()}đ</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Tổng cộng</span>
                                <span>{cartTotal.toLocaleString()}đ</span>
                            </div>
                            
                            <form className={styles.checkoutForm} onSubmit={handleCheckout}>
                                <div className={styles.inputField}>
                                    <label className={styles.label}>Họ và tên</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        className={styles.input} 
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className={styles.inputField}>
                                    <label className={styles.label}>Số điện thoại</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        className={styles.input} 
                                        placeholder="0123 456 789"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className={styles.inputField}>
                                    <label className={styles.label}>Địa chỉ giao hàng</label>
                                    <textarea 
                                        name="address"
                                        className={styles.input} 
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                                
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <AlertModal 
                isOpen={alertConfig.isOpen}
                onClose={handleCloseAlert}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </div>
    );
};

export default CheckoutPage;
