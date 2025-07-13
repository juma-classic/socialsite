const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');

// Import jobs
require('./jobs/scheduledPosts');
require('./jobs/analyticsUpdater');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.POST_RATE_LIMIT || 50,
  message: 'Too many posts created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use('/api/posts', postLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/socialsight'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/webhooks', webhookRoutes);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages: messages
    });
  }
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A resource with this data already exists'
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Please log in again'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Please log in again'
    });
  }
  
  // Default error
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Social Sight API Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Local MongoDB'}`);
});

module.exports = app;
