alert('API_URL: https://e-commerce-owv6.onrender.com/api');
import axios from 'axios';

// ============================================
// API CONFIGURATION
// ============================================

// Use your Render backend URL
const API_URL = 'https://e-commerce-owv6.onrender.com';
console.log('🔗 API_URL:', API_URL);
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR - Add Token to Headers
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Handle Errors
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Forbidden: You don\'t have permission for this action');
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('❌ Not Found:', error.response?.data?.message || 'Resource not found');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('❌ Server Error:', error.response?.data?.message || 'Internal server error');
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  // Register new user
  register: (data) => api.post('/auth/register', data),
  
  // Login user
  login: (data) => api.post('/auth/login', data),
  
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ============================================
// PRODUCT SERVICES
// ============================================

export const productService = {
  // Get all products with filters
  getAll: (params) => api.get('/products', { params }),
  
  // Get single product by ID
  getById: (id) => api.get(`/products/${id}`),
  
  // Get product categories
  getCategories: () => api.get('/products/categories'),
  
  // Create new product (Admin only)
  create: (data) => api.post('/products', data),
  
  // Update product (Admin only)
  update: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product (Admin only)
  delete: (id) => api.delete(`/products/${id}`),
  
  // Add review to product
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  
  // Search products
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// ============================================
// CART SERVICES
// ============================================

export const cartService = {
  // Get user's cart
  getCart: () => api.get('/cart'),
  
  // Add item to cart
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  
  // Update cart item quantity
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  
  // Remove item from cart
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/cart'),
};

// ============================================
// WISHLIST SERVICES
// ============================================

export const wishlistService = {
  // Get user's wishlist
  getWishlist: () => api.get('/wishlist'),
  
  // Add product to wishlist
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  
  // Remove product from wishlist
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

// ============================================
// ORDER SERVICES
// ============================================

export const orderService = {
  // Create new order
  createOrder: (data) => api.post('/orders', data),
  
  // Get user's orders
  getMyOrders: () => api.get('/orders/my-orders'),
  
  // Get single order by ID
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Cancel order
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // Get all orders (Admin only)
  getAllOrders: (params) => api.get('/orders', { params }),
  
  // Update order status (Admin only)
  updateOrderStatus: (id, status, trackingNumber) => 
    api.put(`/orders/${id}/status`, { orderStatus: status, trackingNumber }),
};

// ============================================
// ADMIN SERVICES
// ============================================

export const adminService = {
  // Get dashboard stats
  getStats: () => api.get('/admin/stats'),
  
  // Get all users (Admin only)
  getUsers: (params) => api.get('/admin/users', { params }),
  
  // Update user role (Admin only)
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Block/unblock user (Admin only)
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  
  // Get sales analytics (Admin only)
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================

export default api;
