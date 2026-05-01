import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isStaff, isAdmin } = useAuth();

    if (!isAuthenticated) {
        // Not logged in, redirect to admin login
        return <Navigate to="/admin/login" replace />;
    }

    if (!isStaff && !isAdmin) {
        // Logged in but not a staff/admin, redirect to customer home
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Needs admin, but only staff
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;
