import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/customer/HomePage/HomePage';
import ProductDetailPage from '../pages/customer/ProductDetailPage/ProductDetailPage';
import CheckoutPage from '../pages/customer/CheckoutPage/CheckoutPage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard/AdminDashboard';
import StaffManagementPage from '../pages/admin/StaffManagementPage/StaffManagementPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage/OrderManagementPage';
import ActivityLogPage from '../pages/admin/ActivityLogPage/ActivityLogPage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<StaffManagementPage />} />
        <Route path="/admin/orders" element={<OrderManagementPage />} />
        <Route path="/admin/logs" element={<ActivityLogPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
