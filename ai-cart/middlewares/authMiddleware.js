const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');
  
  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication failed:', error.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};