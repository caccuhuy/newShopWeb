import Modal from './Modal';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import styles from './Modal.module.css';
import { clsx } from 'clsx';

const AlertModal = ({ isOpen, onClose, type = 'info', title, message, onConfirm }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={48} className={styles.alertGreen} />;
            case 'error': return <XCircle size={48} className={styles.alertRed} />;
            case 'warning': return <AlertCircle size={48} className={styles.alertOrange} />;
            default: return <Info size={48} className={styles.alertBlue} />;
        }
    };

    const footer = (
        <>
            {onConfirm && (
                <button className={styles.btnSecondary} onClick={onClose}>Hủy</button>
            )}
            <button 
                className={clsx(styles.btnPrimary, type === 'error' && styles.btnDanger)} 
                onClick={onConfirm || onClose}
            >
                {onConfirm ? 'Xác nhận' : 'Đã hiểu'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || 'Thông báo'} size="sm" footer={footer}>
            <div className={styles.confirmContent}>
                <div className={styles.alertIcon}>
                    {getIcon()}
                </div>
                <p className={styles.confirmText}>{message}</p>
            </div>
        </Modal>
    );
};

export default AlertModal;
