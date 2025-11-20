const express = require('express');
const path = require('path');
const router = express.Router();

// Dashboard
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// Stats page
router.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/stats.html'));
});

// 404 page
router.get('/404', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/404.html'));
});

module.exports = router;