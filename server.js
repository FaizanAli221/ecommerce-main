require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const seedDatabase = require('./utils/seed');
const errorHandler = require('./middleware/errorHandler');
const requireDb = require('./middleware/requireDb');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-in-production';
  console.warn('JWT_SECRET not set — using development default');
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const ready = mongoose.connection.readyState;
  res.json({
    success: true,
    message: 'NexMart API is running',
    mongo: ready === 1 ? 'connected' : 'disconnected',
    mongoState: states[ready] || 'unknown',
    database: mongoose.connection.name || null,
  });
});

app.use('/api/auth', requireDb, authRoutes);
app.use('/api/products', requireDb, productRoutes);
app.use('/api/orders', requireDb, orderRoutes);
app.use('/api/reviews', requireDb, reviewRoutes);
app.use('/api/vendor', requireDb, vendorRoutes);
app.use('/api/admin', requireDb, adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/vendor', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'vendor.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin.html'));
});

app.get('/checkout', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'checkout.html'));
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/register', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.get('/product/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'product.html'));
});

app.get('/orders', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'orders.html'));
});

app.use(errorHandler);

let dbSeeded = false;

async function connectDatabase() {
  try {
    if (mongoose.connection.readyState === 1) return true;
    await connectDB();
    if (!dbSeeded) {
      await seedDatabase();
      dbSeeded = true;
    }
    console.log('Database ready — all API routes are fully operational.');
    return true;
  } catch (err) {
    console.error('\nDatabase connection failed:', err.message);
    if (err.message.includes('bad auth')) {
      console.error(
        'Atlas rejected the password. Please verify your database user credentials in Atlas,\n' +
          'then update MONGODB_URI in .env.'
      );
    }
    return false;
  }
}

async function start() {
  console.log('Connecting to MongoDB...');
  const connected = await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} (pid ${process.pid})`);
    console.log(`API health: http://localhost:${port}/api/health`);
    console.log(`MongoDB: ${connected ? 'connected' : 'disconnected (retrying every 15s...)'}`);
    if (!connected) {
      console.error('Fix .env MONGODB_URI then restart. Atlas: reset password in Database Access if you see "bad auth".');
    }
  });

  if (!connected) {
    console.error('Retrying MongoDB every 15s until connected...');
    setInterval(connectDatabase, 15000);
  }
}

if (require.main === module && !process.env.VERCEL) {
  start();
}

module.exports = app;
