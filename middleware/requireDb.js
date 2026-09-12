const mongoose = require('mongoose');
const connectDB = require('../config/database');

async function requireDb(_req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      return next();
    }
  } catch (err) {
    console.error('Database reconnect failed:', err.message);
  }

  return res.status(503).json({
    success: false,
    message:
      'Database is not connected. In the project folder run npm start and wait for "Database ready". Check http://localhost:3000/api/health — mongo must be "connected".',
    hint: 'Stop other node processes (Ctrl+C), fix MONGODB_URI in .env if needed, then npm start again.',
  });
}

module.exports = requireDb;
