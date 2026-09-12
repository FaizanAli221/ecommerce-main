require('dotenv').config();
const connectDB = require('../config/database');
const mongoose = require('mongoose');

async function main() {
  console.log('Testing MongoDB connection...\n');
  try {
    await connectDB();
    console.log('SUCCESS — connected to database:', mongoose.connection.name);
    process.exit(0);
  } catch (err) {
    console.error('FAILED —', err.message);
    if (err.message.includes('bad auth')) {
      console.error('\n→ Reset password in Atlas → Database Access → edit user → update .env');
    }
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('\n→ Check internet, Atlas Network Access (0.0.0.0/0), and MONGODB_URI');
    }
    process.exit(1);
  }
}

main();
