import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartSuccessModal from '../components/customer/CartSuccessModal/CartSuccessModal';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingScreen from '../components/common/LoadingScreen/LoadingScreen';
import PageLoader from '../components/common/PageLoader/PageLoader';

// Lazy Load Pages
const HomePage = lazy(() => import('../pages/customer/HomePage/HomePage'));
const ProductDetailPage = lazy(() => import('../pages/customer/ProductDetailPage/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../pages/customer/CheckoutPage/CheckoutPage'));
const CategoriesPage = lazy(() => import('../pages/customer/CategoriesPage/CategoriesPage'));
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage/ProfilePage'));
const PurchaseHistoryPage = lazy(() => import('../pages/customer/PurchaseHistoryPage/PurchaseHistoryPage'));
const CustomerLogin = lazy(() => import('../pages/auth/CustomerLogin/CustomerLogin'));
const AdminLogin = lazy(() => import('../pages/auth/AdminLogin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard/AdminDashboard'));
const StaffManagementPage = lazy(() => import('../pages/admin/StaffManagementPage/StaffManagementPage'));
const OrderManagementPage = lazy(() => import('../pages/admin/OrderManagementPage/OrderManagementPage'));
const ActivityLogPage = lazy(() => import('../pages/admin/ActivityLogPage/ActivityLogPage'));
const ProductManagementPage = lazy(() => import('../pages/admin/ProductManagementPage/ProductManagementPage'));
const SupplierManagementPage = lazy(() => import('../pages/admin/SupplierManagementPage/SupplierManagementPage'));
const InventoryManagementPage = lazy(() => import('../pages/admin/InventoryManagementPage/InventoryManagementPage.jsx'));

function AppRoutes() {
  const { showSuccessModal, setShowSuccessModal, lastAddedItem } = useCart();

  return (
    <Router>
      <PageLoader />
      <CartSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        product={lastAddedItem}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/admin/inventory-test" element={<div>Inventory Test Page</div>} />
          <Route path="/admin/inventory" element={
              <ProtectedRoute requireStaff={true}>
                  <InventoryManagementPage />
              </ProtectedRoute>
          } />
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CheckoutPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryName" element={<CategoriesPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistoryPage /></ProtectedRoute>} />
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
              <ProtectedRoute requireStaff={true}>
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
              <ProtectedRoute requireStaff={true}>
                  <AdminDashboard />
              </ProtectedRoute>
          } />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default AppRoutes;
