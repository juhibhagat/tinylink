const express = require('express');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/database');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/web'));
app.use('/api/healthz', require('./routes/api/healthz'));
app.use('/api/links', require('./routes/api/links'));
app.use('/', require('./routes/api/redirect'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});