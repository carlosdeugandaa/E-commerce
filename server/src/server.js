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

// ====== ROOT & HEALTH ======
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-Commerce API is running!',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      auth: {
        test: 'GET /api/auth/test',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ====== AUTH ROUTES (Directly defined) ======
console.log('🛤️ Setting up auth routes...');

// Test auth route
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth test route is working!',
    timestamp: new Date().toISOString()
  });
});

// Register route
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  const { name, email, password } = req.body;
  
  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }
  
  res.json({
    success: true,
    message: 'Registration successful! (Database not connected)',
    user: {
      name,
      email,
      password: '✅ Received (would be hashed)'
    }
  });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Login attempt:', req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  res.json({
    success: true,
    message: 'Login successful! (Database not connected)',
    token: 'mock-jwt-token-12345',
    user: {
      email,
      name: 'Test User'
    }
  });
});

console.log('✅ Auth routes registered:');
console.log('  GET  /api/auth/test');
console.log('  POST /api/auth/register');
console.log('  POST /api/auth/login');

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
