const mongoose = require('mongoose');

/**
 * Book Summary Schema
 * For storing AI-generated book summaries
 */
const BookSummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required']
  },
  keyPoints: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
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

// Virtual for summary length
BookSummarySchema.virtual('summaryLength').get(function() {
  return this.summary ? this.summary.length : 0;
});

// Virtual for key points count
BookSummarySchema.virtual('keyPointsCount').get(function() {
  return this.keyPoints ? this.keyPoints.length : 0;
});

// Set toJSON option to include virtuals
BookSummarySchema.set('toJSON', { virtuals: true });
BookSummarySchema.set('toObject', { virtuals: true });

const BookSummary = mongoose.model('BookSummary', BookSummarySchema);

module.exports = BookSummary;