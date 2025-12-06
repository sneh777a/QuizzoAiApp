const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware to prevent API abuse
 */

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// More strict rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again after an hour.'
  }
});

// Rate limit for quiz creation
const quizCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 5 quiz creations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'You can only create 5 quizzes per hour. Please try again later.'
  }
});

module.exports = { apiLimiter, authLimiter, quizCreationLimiter };