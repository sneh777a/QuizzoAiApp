const express = require('express');
const { register, login, getCurrentUser, logout } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authLimiter, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', authLimiter, login);



/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side)
 * @access Private
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;