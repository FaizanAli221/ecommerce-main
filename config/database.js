const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/nexmart';

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
};

function encodeCredentials(uri) {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) return uri;
  const [, protocol, user, pass, rest] = match;
  const safeUser = encodeURIComponent(decodeURIComponent(user));
  const safePass = encodeURIComponent(decodeURIComponent(pass));
  return `${protocol}${safeUser}:${safePass}@${rest}`;
}

function resolveMongoUri() {
  let uri = process.env.MONGODB_URI || DEFAULT_URI;

  if (uri.includes('<db_password>') || uri.includes('YOUR_PASSWORD') || uri.includes('YOUR_REAL_PASSWORD')) {
    console.warn('MONGODB_URI has a placeholder password. Using local MongoDB:', DEFAULT_URI);
    return DEFAULT_URI;
  }

  if (uri.includes('mongodb.net')) {
    const afterHost = uri.split('.mongodb.net')[1] || '';
    if (!afterHost.startsWith('/') || afterHost.startsWith('/?')) {
      uri = uri.includes('?')
        ? uri.replace('?', '/nexmart?')
        : `${uri.replace(/\/?$/, '')}/nexmart`;
    }
  }

  return encodeCredentials(uri);
}

function setupConnectionEvents() {
  if (mongoose.connection.listeners('disconnected').length > 0) return;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB event: connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB event: disconnected — will retry on next API request or scheduled retry');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB event: error —', err.message);
  });
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  const uri = resolveMongoUri();
  mongoose.set('strictQuery', true);
  setupConnectionEvents();

  await mongoose.connect(uri, connectOptions);
  console.log('MongoDB connected:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
  return mongoose.connection;
}

module.exports = connectDB;
