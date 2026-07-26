console.log('🚀 Starting E-Commerce API Server...');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('📦 Environment loaded:');
console.log('  PORT:', process.env.PORT || '5000');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== TEST ROUTES FIRST ======
console.log('🛤️ Registering test routes...');

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-Commerce API is running!',
    status: 'ok',
    endpoints: {
      test: '/api/test',
      health: '/api/health',
      auth: '/api/auth'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ====== IMPORT ROUTES ======
try {
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
  console.log('✅ Test routes loaded at /api/test');
} catch (error) {
  console.error('❌ Error loading test routes:', error.message);
}

// ====== AUTH ROUTES (Directly defined here for testing) ======
console.log('🛤️ Setting up auth routes directly...');

// Test auth route
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth test route is working!',
    timestamp: new Date().toISOString()
  });
});

// Register route (directly defined)
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  const { name, email, password } = req.body;
  
  res.json({
    success: true,
    message: 'Registration endpoint is working!',
    data: {
      name: name || 'No name provided',
      email: email || 'No email provided',
      password: password ? '✅ Received' : '❌ Missing'
    }
  });
});

// Login route (directly defined)
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Login attempt:', req.body);
  const { email, password } = req.body;
  
  res.json({
    success: true,
    message: 'Login endpoint is working!',
    data: {
      email: email || 'No email provided',
      password: password ? '✅ Received' : '❌ Missing'
    }
  });
});

console.log('✅ Auth routes registered:');
console.log('  GET  /api/auth/test');
console.log('  POST /api/auth/register');
console.log('  POST /api/auth/login');

// ====== TRY TO LOAD OTHER ROUTES ======
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded from file');
} catch (error) {
  console.log('⚠️ Auth routes file not found, using direct routes');
}

try {
  const productRoutes = require('./routes/products');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (error) {
  console.log('⚠️ Product routes file not found');
}

try {
  const orderRoutes = require('./routes/orders');
  app.use('/api/orders', orderRoutes);
  console.log('✅ Order routes loaded');
} catch (error) {
  console.log('⚠️ Order routes file not found');
}

try {
  const cartRoutes = require('./routes/cart');
  app.use('/api/cart', cartRoutes);
  console.log('✅ Cart routes loaded');
} catch (error) {
  console.log('⚠️ Cart routes file not found');
}

// ====== ERROR HANDLING ======
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/auth/test`);
  console.log(`📍 Register: POST http://localhost:${PORT}/api/auth/register`);
});

console.log('🚀 Server setup complete!');
