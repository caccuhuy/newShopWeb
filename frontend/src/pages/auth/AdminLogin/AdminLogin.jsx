import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const loggedInUser = await login(email, password, true);
            if (loggedInUser.role === 'Staff' || loggedInUser.role === 'Admin') {
                navigate('/admin');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Portal</h1>
                <p className={styles.subtitle}>Đăng nhập dành cho quản trị viên và nhân viên</p>
                
                {error && <div className={styles.error}>{error}</div>}
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Email nội bộ</label>
                        <input 
                            type="email" 
                            className={styles.input} 
                            placeholder="staff@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label className={styles.label}>Mật khẩu</label>
                        <input 
                            type="password" 
                            className={styles.input} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                    </button>
                </form>
                
                <div className={styles.footer}>
                    <Link to="/" className={styles.homeLink}>
                        ← Trở về trang cửa hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
