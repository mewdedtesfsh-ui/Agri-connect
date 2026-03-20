const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve uploaded files
app.use('/api/uploads', express.static('uploads'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/users', require('./routes/profile'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/markets', require('./routes/markets'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/extension', require('./routes/extension'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/weather-alerts', require('./routes/weather-alerts'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ratings', require('./routes/ratings'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgriConnect API is running' });
});

// The "catchall" handler: for any request that doesn't
// match one above (and isn't an API call), send back React's index.html file.
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
