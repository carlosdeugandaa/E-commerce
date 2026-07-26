console.log('🚀 Server starting...');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('📦 Environment loaded:');
console.log('  PORT:', process.env.PORT || '5000');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');

const app = express();

// Simple middleware
app.use(cors());
app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-Commerce API is running!',
    status: 'ok',
    time: new Date().toISOString()
  });
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

console.log('✅ Server setup complete');
