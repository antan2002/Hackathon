require('dotenv').config();
console.log(".env loaded");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
console.log("Required modules loaded");

const logger = require('./utils/logger');
console.log("Logger loaded");

const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
console.log("Routes loaded");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Middleware initialized");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    logger.info('MongoDB connected successfully');
  })
  .catch(err => {
    console.error("MongoDB error:", err);
    logger.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
