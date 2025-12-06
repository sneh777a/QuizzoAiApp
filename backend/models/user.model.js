const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password in queries
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  notificationPreferences: {
    email: {
      quizReminders: {
        type: Boolean,
        default: true
      },
      quizResults: {
        type: Boolean,
        default: true
      },
      newFeatures: {
        type: Boolean,
        default: false
      }
    },
    inApp: {
      quizReminders: {
        type: Boolean,
        default: true
      },
      quizResults: {
        type: Boolean,
        default: true
      },
      participantJoined: {
        type: Boolean,
        default: true
      }
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;