const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth.config');
const User = require('../models/user.model');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not allowed to access this resource`
      });
    }
    
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };