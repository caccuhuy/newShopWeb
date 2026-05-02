import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/customer/HomePage/HomePage';
import ProductDetailPage from '../pages/customer/ProductDetailPage/ProductDetailPage';
import CheckoutPage from '../pages/customer/CheckoutPage/CheckoutPage';
import CustomerLogin from '../pages/auth/CustomerLogin/CustomerLogin';
import AdminLogin from '../pages/auth/AdminLogin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard/AdminDashboard';
import StaffManagementPage from '../pages/admin/StaffManagementPage/StaffManagementPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage/OrderManagementPage';
import ActivityLogPage from '../pages/admin/ActivityLogPage/ActivityLogPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage/ProductManagementPage';
import SupplierManagementPage from '../pages/admin/SupplierManagementPage/SupplierManagementPage';
import InventoryManagementPage from '../pages/admin/InventoryManagementPage/InventoryManagementPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/inventory-test" element={<div>Inventory Test Page</div>} />
        <Route path="/admin/inventory" element={
            <ProtectedRoute>
                <InventoryManagementPage />
            </ProtectedRoute>
        } />
        {/* Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CheckoutPage />} />
        <Route path="/login" element={<CustomerLogin />} />
        
        {/* Admin/Staff Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/staff" element={
            <ProtectedRoute requireAdmin={true}>
                <StaffManagementPage />
            </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
            <ProtectedRoute>
                <OrderManagementPage />
            </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
            <ProtectedRoute requireAdmin={true}>
                <ActivityLogPage />
            </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
            <ProtectedRoute requireAdmin={true}>
                <ProductManagementPage />
            </ProtectedRoute>
        } />
        <Route path="/admin/suppliers" element={
            <ProtectedRoute requireAdmin={true}>
                <SupplierManagementPage />
            </ProtectedRoute>
        } />
        <Route path="/admin" element={
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
