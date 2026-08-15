/**
 * Authentication configuration
 */
module.exports = {
  // JWT secret key for signing tokens
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  
  // JWT token expiration time
  jwtExpiration: process.env.JWT_EXPIRE || '30d',
  
  // Password reset token expiration (in milliseconds)
  passwordResetExpire: 3600000, // 1 hour
};