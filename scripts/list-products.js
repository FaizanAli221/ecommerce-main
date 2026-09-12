require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Product = require('../models/Product');

async function listProducts() {
  try {
    await connectDB();
    console.log('Connected to DB');
    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p._id}`);
      console.log(`    Name: ${p.name}`);
      console.log(`    Category: ${p.category}`);
      console.log(`    Image: ${p.image}`);
      console.log(`    Price: ${p.price}`);
      console.log(`    Active: ${p.isActive}`);
      console.log('------------------------------');
    });
    process.exit(0);
  } catch (err) {
    console.error('Error listing products:', err);
    process.exit(1);
  }
}

listProducts();
