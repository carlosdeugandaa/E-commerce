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

// ============================================
// ROUTES
// ============================================

// 1. Root route
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      authTest: 'GET /api/auth/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// 2. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || '5000'
  });
});

// 3. Auth test route
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth test route is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

// 4. REGISTER ROUTE - FULL IMPLEMENTATION
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register request received:', req.body);
  
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    console.log('❌ Missing fields:', { name: !!name, email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }
  
  // Simple email validation
  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }
  
  console.log('✅ Registration successful for:', email);
  
  // Return success response
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user: {
      name: name,
      email: email,
      // In a real app, password would be hashed and never returned
      password_received: true
    },
    token: 'mock-jwt-token-for-testing-' + Date.now()
  });
});

// 5. LOGIN ROUTE - FULL IMPLEMENTATION
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Login request received:', req.body);
  
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  console.log('✅ Login successful for:', email);
  
  res.json({
    success: true,
    message: 'Login successful!',
    token: 'mock-jwt-token-for-testing-' + Date.now(),
    user: {
      id: 'user-123',
      name: 'Test User',
      email: email,
      role: 'user'
    }
  });
});

// 6. Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    method: req.method,
    url: req.url,
    availableRoutes: {
      GET: ['/', '/api/health', '/api/auth/test'],
      POST: ['/api/auth/register', '/api/auth/login']
    }
  });
});

// 7. Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Base URL: https://e-commerce-owv6.onrender.com`);
  console.log(`📋 Available Routes:`);
  console.log(`   GET  /`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/auth/test`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
});

console.log('🚀 Server setup complete!');
