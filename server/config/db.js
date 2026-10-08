const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/stacksentinel';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[Database] MongoDB Connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[Database Error] ${error.message}`);
    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
      // In standalone server mode, exit if cannot connect to database
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

