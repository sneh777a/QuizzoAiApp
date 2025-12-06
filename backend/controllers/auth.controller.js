const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { jwtSecret, jwtExpiration } = require('../config/auth.config');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiration
  });
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    // Save user to database
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};



/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side)
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = (req, res) => {
  // JWT is stateless, so we just return a success message
  // The client should remove the token from storage
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};