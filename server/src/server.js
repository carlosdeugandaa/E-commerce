console.log('🚀 Starting E-Commerce API Server...');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('📦 Environment loaded:');
console.log('  PORT:', process.env.PORT || '5000');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET');

const app = express();

// ============================================
// CORS - Specific Origins Only
// ============================================
app.use(cors({
  origin: [
    'https://carlosdeugandaa.github.io',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log('✅ CORS configured for:');
console.log('  - https://carlosdeugandaa.github.io');
console.log('  - http://localhost:3000');
console.log('  - http://localhost:5000');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MONGODB CONNECTION
// ============================================

let dbConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    dbConnected = true;
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Running without database - using in-memory storage');
    dbConnected = false;
    return false;
  }
};

// ============================================
// IMPORT ROUTES
// ============================================

console.log('📂 Importing routes...');

// Auth routes
const authRoutes = require('./routes/auth');

// Product routes
const productRoutes = require('./routes/products');

// Order routes
const orderRoutes = require('./routes/orders');

// Cart routes
const cartRoutes = require('./routes/cart');

// Wishlist routes
const wishlistRoutes = require('./routes/wishlist');

console.log('✅ All routes imported successfully');

// ============================================
// REGISTER ROUTES
// ============================================

console.log('🛤️ Registering routes...');

// Auth routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Wishlist routes
app.use('/api/wishlist', wishlistRoutes);

console.log('✅ Routes registered:');
console.log('  /api/auth     - Authentication');
console.log('  /api/products - Products');
console.log('  /api/orders   - Orders');
console.log('  /api/cart     - Cart');
console.log('  /api/wishlist - Wishlist');

// ============================================
// ROOT & HEALTH ROUTES
// ============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? '✅ Connected' : '❌ Not connected (using memory)',
    cors: '✅ Specific origins only',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register, POST /api/auth/login',
      products: 'GET /api/products, GET /api/products/:id',
      cart: 'GET /api/cart, POST /api/cart, PUT /api/cart/:itemId, DELETE /api/cart/:itemId',
      orders: 'POST /api/orders, GET /api/orders/my-orders',
      wishlist: 'GET /api/wishlist, POST /api/wishlist, DELETE /api/wishlist/:productId'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: dbConnected ? '✅ Connected' : '❌ Not connected (using memory)',
    routes: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart',
      wishlist: '/api/wishlist'
    }
  });
});

// ============================================
// CATCH-ALL ROUTE
// ============================================

app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    method: req.method,
    url: req.url,
    availableRoutes: {
      GET: [
        '/',
        '/api/health',
        '/api/products',
        '/api/products/:id',
        '/api/cart',
        '/api/orders/my-orders',
        '/api/wishlist'
      ],
      POST: [
        '/api/auth/register',
        '/api/auth/login',
        '/api/products',
        '/api/orders',
        '/api/cart',
        '/api/wishlist'
      ],
      PUT: [
        '/api/cart/:itemId',
        '/api/products/:id',
        '/api/orders/:id/status'
      ],
      DELETE: [
        '/api/cart/:itemId',
        '/api/cart',
        '/api/wishlist/:productId',
        '/api/products/:id'
      ]
    }
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('  Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Base URL: https://e-commerce-owv6.onrender.com`);
    console.log(`📋 Database: ${dbConnected ? '✅ MongoDB' : '❌ Memory (fallback)'}`);
    console.log(`🔒 CORS: Specific origins only`);
    console.log(`📋 Available Routes:`);
    console.log(`   GET  /`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/products`);
    console.log(`   POST /api/products`);
    console.log(`   GET  /api/cart`);
    console.log(`   POST /api/cart`);
    console.log(`   GET  /api/wishlist`);
    console.log(`   POST /api/wishlist`);
    console.log(`   POST /api/orders`);
  });
};

startServer();
