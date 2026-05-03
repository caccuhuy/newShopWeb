import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    const [shake, setShake] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        // Optional: If you want to close on overlay click, call onClose() here instead
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div 
                className={clsx(styles.content, styles[size], shake && styles.shake)} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                
                <div className={styles.body}>
                    {children}
                </div>

                {footer && (
                    <div className={styles.footer}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
