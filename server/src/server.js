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
// CORS - Option 1: Specific Origins Only
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
// USER SCHEMA (if MongoDB is connected)
// ============================================

let User = null;
try {
  // Define schema only if mongoose is available
  if (mongoose.connection.readyState === 1) {
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, default: 'user' },
      createdAt: { type: Date, default: Date.now }
    });
    User = mongoose.model('User', userSchema);
    console.log('✅ User model created');
  }
} catch (error) {
  console.error('❌ Error creating User model:', error.message);
}

// ============================================
// IN-MEMORY STORAGE (Fallback)
// ============================================

const tempUsers = [];

// ============================================
// ROUTES
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
      authTest: 'GET /api/auth/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
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
    users: tempUsers.length
  });
});

// Auth test route
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth test route is working!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// REGISTER ROUTE - WITH DATABASE SUPPORT
// ============================================

app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }

  try {
    let user;

    // If MongoDB is connected, save to database
    if (dbConnected && User) {
      console.log('💾 Saving user to MongoDB...');
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Create new user in database
      user = await User.create({
        name,
        email,
        password, // In production, hash this!
        role: 'user'
      });

      console.log('✅ User saved to MongoDB:', user.email);

      // Return success with user data
      return res.status(201).json({
        success: true,
        message: 'Registration successful! (MongoDB)',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: 'mock-jwt-token-' + Date.now()
      });
    }

    // Fallback: Save to memory
    console.log('💾 Saving user to memory (fallback)...');
    user = {
      id: 'user-' + Date.now(),
      name,
      email,
      password,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    tempUsers.push(user);

    console.log('✅ User saved to memory:', user.email);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! (Memory)',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: 'mock-jwt-token-' + Date.now()
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
});

// ============================================
// LOGIN ROUTE - WITH DATABASE SUPPORT
// ============================================

app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 Login request received:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  try {
    let user;

    // If MongoDB is connected, find user in database
    if (dbConnected && User) {
      console.log('🔍 Searching for user in MongoDB...');
      user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // In production, compare hashed passwords
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log('✅ User found in MongoDB:', user.email);

      return res.json({
        success: true,
        message: 'Login successful! (MongoDB)',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Fallback: Search in memory
    console.log('🔍 Searching for user in memory...');
    user = tempUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found in memory:', user.email);

    return res.json({
      success: true,
      message: 'Login successful! (Memory)',
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
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
      GET: ['/', '/api/health', '/api/auth/test'],
      POST: ['/api/auth/register', '/api/auth/login']
    }
  });
});

// ============================================
// ERROR HANDLER
// ============================================

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
    console.log(`   GET  /api/auth/test`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
  });
};

startServer();
