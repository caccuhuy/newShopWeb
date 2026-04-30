import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage/HomePage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import LoginPage from './pages/LoginPage/LoginPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import AdminPage from './pages/AdminPage/AdminPage';
import StaffManagementPage from './pages/StaffManagementPage/StaffManagementPage';
import OrderManagementPage from './pages/OrderManagementPage/OrderManagementPage';
import ActivityLogPage from './pages/ActivityLogPage/ActivityLogPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/staff" element={<StaffManagementPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/logs" element={<ActivityLogPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
