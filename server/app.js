const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const deploymentRoutes = require('./routes/deploymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const app = express();

// Auto-connect to MongoDB if disconnected (critical for serverless / cloud deployments)
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Auto-Connect Error]', err.message);
    }
  }
  next();
});

// Security HTTP headers
app.use(helmet());


// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local development & testing
  },
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logger (disabled during test runs)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    platform: 'StackSentinel API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
