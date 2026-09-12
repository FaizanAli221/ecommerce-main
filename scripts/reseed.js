require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const seedDatabase = require('../utils/seed');

async function run() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Wiping existing Users (old accounts)...');
    await User.deleteMany({});

    console.log('Wiping existing Products...');
    await Product.deleteMany({});
    
    console.log('Wiping existing Orders...');
    await Order.deleteMany({});
    
    console.log('Wiping existing Reviews...');
    await Review.deleteMany({});

    console.log('Running database seeding script...');
    await seedDatabase();

    console.log('SUCCESS — Database reseeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE during reseeding:', err);
    process.exit(1);
  }
}

run();
