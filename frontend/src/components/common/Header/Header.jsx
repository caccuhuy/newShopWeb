import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, LogOut, User } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
    const { cartCount } = useCart();
    const { user, isAuthenticated, logout, isStaff } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>Shop</Link>
                
                <nav className={styles.nav}>
                    <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                        Home
                    </NavLink>
                    {isAuthenticated && !isStaff && (
                        <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                            Profile
                        </NavLink>
                    )}
                    {isStaff && (
                        <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                            Admin
                        </NavLink>
                    )}
                </nav>

                <div className={styles.actions}>
                    <form className={styles.searchWrapper} onSubmit={handleSearch}>
                        <Search className={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm sản phẩm..." 
                            className={styles.searchInput} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <button className={styles.cartBtn} onClick={() => navigate('/cart')}>
                        <ShoppingBag className={styles.cartIcon} />
                        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                    </button>

                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <User className={styles.userIconSmall} />
                            <span className={styles.userName}>{user?.name}</span>
                            <button onClick={logout} className={styles.logoutBtn}>
                                <LogOut className={styles.logoutIcon} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className={styles.loginLink}>
                            <User className={styles.userIconLarge} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
