const mongoose = require("mongoose");

/**
 * Answer Schema (embedded in Result)
 */
const AnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Result Schema
 */
const ResultSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    answers: [AnswerSchema],
    totalScore: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for percentage score
ResultSchema.virtual("percentageScore").get(function () {
  if (!this.answers || this.answers.length === 0) return 0;
  return Math.round((this.correctAnswers / this.answers.length) * 100);
});

// Set toJSON option to include virtuals
ResultSchema.set("toJSON", { virtuals: true });
ResultSchema.set("toObject", { virtuals: true });

const Result = mongoose.model("Result", ResultSchema);

module.exports = Result;
