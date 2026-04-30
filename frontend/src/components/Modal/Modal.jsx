import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                {title && <h2 className={styles.title}>{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
