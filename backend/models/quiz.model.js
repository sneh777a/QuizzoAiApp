const mongoose = require("mongoose");

/**
 * Question Schema (embedded in Quiz)
 */
const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: [true, "Option text is required"],
        trim: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
        default: false,
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
    },
  ],
  explanation: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 1,
    min: [1, "Points must be at least 1"],
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30,
    min: [5, "Time limit must be at least 5 seconds"],
  },
});

/**
 * Quiz Schema
 */
const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: ["Book", "Topic"],
      required: [true, "Category is required"],
    },
    topicName: {
      type: String,
      trim: true,
      required: [true, "Topic name is required"],
    },
    topicDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    questions: [QuestionSchema],

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalTimeLimit: {
      type: Number, // in seconds
      default: function () {
        // Default to sum of all question time limits
        if (this.questions && this.questions.length > 0) {
          return this.questions.reduce((sum, q) => sum + q.timeLimit, 0);
        }
        return 300; // 5 minutes default
      },
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "cancelled"],
      default: "draft",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
      trim: true,
    },
    scheduledFor: {
      type: Date,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["waiting", "active", "completed", "left"],
          default: "waiting",
        },
      },
    ],
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

// Virtual for participant count
QuizSchema.virtual("participantCount").get(function () {
  return this.participants ? this.participants.length : 0;
});

// Virtual for question count
QuizSchema.virtual("questionCount").get(function () {
  return this.questions ? this.questions.length : 0;
});

// Set toJSON option to include virtuals
QuizSchema.set("toJSON", { virtuals: true });
QuizSchema.set("toObject", { virtuals: true });

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
