/**
 * Database seeding script
 *
 * This script seeds the database with sample data for testing purposes.
 *
 * Usage: node scripts/seed-database.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Quiz = require("../models/quiz.model");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

/**
 * Print a colored message to the console
 * @param {string} message - The message to print
 * @param {string} color - The color to use
 */
function printColored(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    printColored("Connected to MongoDB", colors.green);
  } catch (error) {
    printColored(`MongoDB connection error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Create sample users
 * @returns {Promise<Object>} - Object containing created users
 */
async function createUsers() {
  printColored("\nCreating sample users...", colors.cyan);

  // Delete existing users
  await User.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await User.create({
    username: "admin",
    email: "admin@example.com",
    password: adminPassword,
    role: "admin",
  });

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await User.create({
    username: "testuser",
    email: "user@example.com",
    password: userPassword,
    role: "user",
  });

  printColored(`Created ${await User.countDocuments()} users`, colors.green);

  return { admin, user };
}

/**
 * Create sample quizzes
 * @param {Object} users - Object containing created users
 */
async function createQuizzes(users) {
  printColored("\nCreating sample quizzes...", colors.cyan);

  // Delete existing quizzes
  await Quiz.deleteMany({});

  // Sample questions
  const javascriptQuestions = [
    {
      text: "What is JavaScript?",
      options: [
        { text: "A programming language", isCorrect: true },
        { text: "A markup language", isCorrect: false },
        { text: "A database", isCorrect: false },
        { text: "An operating system", isCorrect: false },
      ],
      explanation:
        "JavaScript is a programming language commonly used for web development.",
      timeLimit: 30,
    },
    {
      text: "Which of the following is not a JavaScript data type?",
      options: [
        { text: "String", isCorrect: false },
        { text: "Boolean", isCorrect: false },
        { text: "Float", isCorrect: true },
        { text: "Object", isCorrect: false },
      ],
      explanation:
        "JavaScript has the following primitive data types: String, Number, Boolean, Undefined, Null, Symbol, and BigInt. Float is not a separate data type in JavaScript.",
      timeLimit: 30,
    },
  ];

  const historyQuestions = [
    {
      text: "Who was the first President of the United States?",
      options: [
        { text: "Thomas Jefferson", isCorrect: false },
        { text: "George Washington", isCorrect: true },
        { text: "Abraham Lincoln", isCorrect: false },
        { text: "John Adams", isCorrect: false },
      ],
      explanation:
        "George Washington was the first President of the United States, serving from 1789 to 1797.",
      timeLimit: 20,
    },
    {
      text: "In which year did World War II end?",
      options: [
        { text: "1943", isCorrect: false },
        { text: "1944", isCorrect: false },
        { text: "1945", isCorrect: true },
        { text: "1946", isCorrect: false },
      ],
      explanation:
        "World War II ended in 1945 with the surrender of Germany in May and Japan in September.",
      timeLimit: 20,
    },
  ];

  // Create quizzes
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // JavaScript Quiz (scheduled for tomorrow)
  await Quiz.create({
    title: "JavaScript Basics",
    topicDescription: "Test your knowledge of JavaScript fundamentals",
    creator: users.admin._id,
    questions: javascriptQuestions,
    category: "Topic",
    topicName: "JavaScript Programming",
    difficulty: "medium",
    totalTimeLimit: 60,
    status: "scheduled",
    scheduledFor: tomorrow,
    isPublic: true,
  });

  // History Quiz (scheduled for next week)
  await Quiz.create({
    title: "History Quiz",
    topicDescription: "Test your knowledge of world history",
    creator: users.user._id,
    questions: historyQuestions,
    category: "Topic",
    topicName: "World History",
    difficulty: "easy",
    totalTimeLimit: 40,
    status: "scheduled",
    scheduledFor: nextWeek,
    isPublic: true,
  });

  printColored(`Created ${await Quiz.countDocuments()} quizzes`, colors.green);
}

/**
 * Seed the database
 */
async function seedDatabase() {
  printColored("=== Seeding Database ===\n", colors.bright + colors.green);

  try {
    // Connect to MongoDB
    await connectDB();

    // Create sample data
    const users = await createUsers();
    await createQuizzes(users);

    printColored(
      "\n=== Database seeding completed successfully ===",
      colors.bright + colors.green
    );
    printColored("\nSample User Credentials:", colors.bright + colors.cyan);
    printColored("Admin: admin@example.com / admin123", colors.yellow);
    printColored("User: user@example.com / user123", colors.yellow);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    printColored("\nDisconnected from MongoDB", colors.green);
  } catch (error) {
    printColored(`\nError seeding database: ${error.message}`, colors.red);
    if (error.stack) {
      console.error(error.stack);
    }

    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      printColored("Disconnected from MongoDB", colors.green);
    } catch (disconnectError) {
      printColored(
        `Error disconnecting from MongoDB: ${disconnectError.message}`,
        colors.red
      );
    }

    process.exit(1);
  }
}

// Run the seeding process
seedDatabase().catch((error) => {
  printColored(`Unhandled error: ${error.message}`, colors.red);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
