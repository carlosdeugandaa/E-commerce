console.log('🚀 Starting E-Commerce API Server...');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('📦 Environment loaded:');
console.log('  PORT:', process.env.PORT || '5000');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET (using localhost)');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== ROUTES ======

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    env: {
      mongodb: process.env.MONGODB_URI ? '✅ configured' : '❌ missing',
      jwt: process.env.JWT_SECRET ? '✅ configured' : '❌ missing'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)'
      },
      products: {
        all: 'GET /api/products',
        single: 'GET /api/products/:id',
        create: 'POST /api/products (admin)'
      },
      orders: {
        all: 'GET /api/orders (admin)',
        my: 'GET /api/orders/my-orders',
        create: 'POST /api/orders'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart',
        update: 'PUT /api/cart/:itemId',
        remove: 'DELETE /api/cart/:itemId'
      }
    }
  });
});

// ====== API ROUTES ======
console.log('🛤️ Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

console.log('✅ Routes registered:');
console.log('  /api/auth');
console.log('  /api/products');
console.log('  /api/orders');
console.log('  /api/cart');

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ====== DATABASE CONNECTION ======
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (optional - will work even without DB for testing)
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('⚠️ No MONGODB_URI provided - running without database');
      console.log('   To connect to MongoDB, add MONGODB_URI to your environment variables');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Continuing without database...');
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📍 Test register: POST http://localhost:${PORT}/api/auth/register`);
  });
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});
