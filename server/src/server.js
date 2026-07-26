console.log('🚀 Starting server...');
console.log('📁 Current directory:', __dirname);
console.log('📁 Process working directory:', process.cwd());

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('📦 Loading environment variables...');
dotenv.config();

console.log('🔑 Checking environment variables:');
console.log('  PORT:', process.env.PORT || 'not set (using 5000)');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ set' : '❌ NOT SET!');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ set' : '❌ NOT SET!');

// Import routes
console.log('📂 Importing routes...');
try {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const orderRoutes = require('./routes/orders');
  const cartRoutes = require('./routes/cart');
  console.log('✅ Routes imported successfully');
} catch (error) {
  console.error('❌ Error importing routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Import middleware
console.log('📂 Importing middleware...');
try {
  const { errorHandler } = require('./middleware/errorHandler');
  console.log('✅ Middleware imported successfully');
} catch (error) {
  console.error('❌ Error importing middleware:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('🏗️ Creating Express app...');
const app = express();

// Middleware
console.log('⚙️ Setting up middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
console.log('🛤️ Setting up routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
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
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart'
    }
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler').errorHandler);

console.log('🔄 Connecting to MongoDB...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('  Using URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('  Full error:', error);
    return false;
  }
};

// Start server
const startServer = async () => {
  console.log('🚀 Starting server...');
  
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database.');
    console.error('  Please check your MONGODB_URI environment variable.');
    console.error('  Exiting...');
    process.exit(1);
  }
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
};

console.log('🏃 Starting application...');
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  console.error('  Stack:', err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('  Stack:', err.stack);
});

console.log('✅ Server setup complete, waiting for connections...');
