import { useState, useEffect } from 'react';
import Header from '../../../components/common/Header/Header';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone_number: '', default_address: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await apiService.getCustomerProfile();
                setProfile(data);
                setForm({
                    name: data.username || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    default_address: data.default_address || '',
                    password: ''
                });
                localStorage.setItem('customerUser', JSON.stringify({
                    name: data.username || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    default_address: data.default_address || '',
                    role_name: data.role_name || 'Customer'
                }));
            } catch (err) {
                setError(err.message || 'Không thể tải thông tin hồ sơ.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const updated = await apiService.updateCustomerProfile({
                name: form.name,
                phone_number: form.phone_number,
                default_address: form.default_address,
                password: form.password
            });
            setMessage(updated.message || 'Cập nhật hồ sơ thành công');
            const updatedProfile = { ...profile, username: form.name, phone_number: form.phone_number, default_address: form.default_address };
            setProfile(updatedProfile);
            localStorage.setItem('customerUser', JSON.stringify({
                name: form.name,
                email: form.email,
                phone_number: form.phone_number,
                default_address: form.default_address,
                role_name: updatedProfile.role_name || 'Customer'
            }));
            setForm(prev => ({ ...prev, password: '' }));
        } catch (err) {
            setError(err.message || 'Lỗi khi lưu hồ sơ.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <main className={styles.container}>
                <h1 className={styles.title}>Hồ sơ khách hàng</h1>

                {loading ? (
                    <div className={styles.statusMessage}>Đang tải thông tin...</div>
                ) : error ? (
                    <div className={styles.errorMessage}>{error}</div>
                ) : (
                    <div className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <div>
                                <p className={styles.sectionLabel}>Tên đăng nhập</p>
                                <h2 className={styles.profileName}>{profile.username}</h2>
                                <p className={styles.profileRole}>{profile.role_name || 'Customer'}</p>
                            </div>
                        </div>

                        <form className={styles.profileForm} onSubmit={handleSubmit}>
                            <div className={styles.grid}>
                                <label className={styles.field}>
                                    <span>Tên khách hàng</span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>Email</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        disabled
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>Số điện thoại</span>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className={styles.fieldFull}>
                                    <span>Địa chỉ mặc định</span>
                                    <textarea
                                        name="default_address"
                                        value={form.default_address}
                                        onChange={handleChange}
                                        rows={4}
                                        required
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>Mật khẩu mới</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Để trống nếu không đổi"
                                    />
                                </label>
                            </div>

                            {message && <div className={styles.successMessage}>{message}</div>}
                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <button type="submit" className={styles.saveButton} disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;
