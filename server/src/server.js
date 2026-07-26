// MINIMAL SERVER - No dependencies except express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Log everything
console.log('🚀 Starting minimal server...');
console.log('📦 PORT:', PORT);
console.log('📦 NODE_ENV:', process.env.NODE_ENV || 'development');

// Simple routes
app.get('/', (req, res) => {
    res.send('✅ Server is running!');
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
});

console.log('✅ Server setup complete, waiting for connections...');
