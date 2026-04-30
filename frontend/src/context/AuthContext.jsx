import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const login = async (email, password, isStaff = false) => {
        try {
            const data = await apiService.login(email, password, isStaff);
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const register = async (userData) => {
        return await apiService.register(userData);
    };

    const isAuthenticated = !!token;
    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout, 
            register, 
            isAuthenticated, 
            isStaff, 
            isAdmin 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
