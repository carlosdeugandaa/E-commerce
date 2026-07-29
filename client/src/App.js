import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
// At the top, after imports
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // This will show the API URL on the page
    const debug = document.createElement('div');
    debug.style.position = 'fixed';
    debug.style.bottom = '10px';
    debug.style.right = '10px';
    debug.style.background = 'rgba(0,0,0,0.8)';
    debug.style.color = 'white';
    debug.style.padding = '10px';
    debug.style.fontSize = '12px';
    debug.style.zIndex = '9999';
    debug.innerHTML = `API: https://e-commerce-owv6.onrender.com/api`;
    document.body.appendChild(debug);
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ... your routes ... */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
console.log('🚀 App is rendering!'); // ← ADD THIS

function App() {
  console.log('📦 App component mounted'); // ← ADD THIS
  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
