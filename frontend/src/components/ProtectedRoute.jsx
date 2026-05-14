import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }) => {
    const { isAuthenticated, isStaff, isAdmin } = useAuth();

    if (!isAuthenticated) {
        // Not logged in
        if (requireAdmin || requireStaff) {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // Customer only route, but user is staff/admin -> redirect to admin dashboard
    // Optional depending on if staff can buy things, but usually good practice to separate
    
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    if (requireStaff && (!isStaff && !isAdmin)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
