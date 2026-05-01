import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './LoginPage.module.css';
import { clsx } from 'clsx';

const LoginPage = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isStaffMode, setIsStaffMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            if (mode === 'login') {
                await login(email, password, isStaffMode);
                navigate(isStaffMode ? '/admin' : '/');
            } else {
                await register({ name, email, password });
                setSuccess('Đăng ký thành công! Hãy đăng nhập.');
                setMode('login');
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
                <h1 className={styles.title}>
                    {mode === 'register' ? 'Đăng ký tài khoản' : (isStaffMode ? 'Staff Portal' : 'Chào mừng trở lại')}
                </h1>
                <p className={styles.subtitle}>
                    {mode === 'register' 
                        ? 'Tham gia cùng cộng đồng mua sắm ArchitectLedger' 
                        : (isStaffMode ? 'Đăng nhập dành cho nhân viên' : 'Đăng nhập vào tài khoản khách hàng của bạn')}
                </p>
                
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className={styles.field}>
                            <label className={styles.label}>Họ và tên</label>
                            <input 
                                type="text" 
                                className={styles.input} 
                                placeholder="Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </div>
                    )}
                    
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input 
                            type="email" 
                            className={styles.input} 
                            placeholder="your@email.com"
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
                        {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>
                
                <div className={styles.footer}>
                    {mode === 'login' ? (
                        <>
                            <p>
                                Chưa có tài khoản?{' '}
                                <button onClick={() => setMode('register')} className={clsx(styles.link, styles.textLink)}>
                                    Đăng ký ngay
                                </button>
                            </p>
                            {!isStaffMode && (
                                <p className={styles.footerText}>
                                    Bạn là nhân viên?{' '}
                                    <button onClick={() => setIsStaffMode(true)} className={clsx(styles.link, styles.textLink)}>
                                        Truy cập Portal
                                    </button>
                                </p>
                            )}
                            {isStaffMode && (
                                <p className={styles.footerText}>
                                    Quay lại trang khách?{' '}
                                    <button onClick={() => setIsStaffMode(false)} className={clsx(styles.link, styles.textLink)}>
                                        Đăng nhập khách
                                    </button>
                                </p>
                            )}
                        </>
                    ) : (
                        <p>
                            Đã có tài khoản?{' '}
                            <button onClick={() => setMode('login')} className={clsx(styles.link, styles.textLink)}>
                                Đăng nhập
                            </button>
                        </p>
                    )}
                    <Link to="/" className={clsx(styles.link, styles.homeLink)}>
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
