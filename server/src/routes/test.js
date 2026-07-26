const express = require('express');
const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  });
});

// Test POST route
router.post('/echo', (req, res) => {
  res.json({
    message: 'Echo route working!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
