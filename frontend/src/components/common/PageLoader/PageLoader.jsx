import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageLoader.module.css';

const PageLoader = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600); // Simulate loading time for smooth transition

        return () => clearTimeout(timer);
    }, [location]);

    if (!loading) return null;

    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressBar}></div>
        </div>
    );
};

export default PageLoader;
