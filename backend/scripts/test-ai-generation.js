/**
 * Test script for AI question generation
 *
 * This script tests the AI service by generating quiz questions
 * and displaying them in the console.
 *
 * Usage: node scripts/test-ai-generation.js
 */

require("dotenv").config();
const aiService = require("../services/ai.service");

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
 * Test the AI question generation
 */
async function testAIGeneration() {
  printColored(
    "=== Testing AI Question Generation ===\n",
    colors.bright + colors.green
  );

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    printColored("Error: GEMINI_API_KEY is not set in .env file", colors.red);
    printColored(
      "Please add your Gemini API key to the .env file and try again.",
      colors.yellow
    );
    process.exit(1);
  }

  // Initialize AI service
  try {
    printColored("Initializing AI service...", colors.cyan);
    aiService.initialize(process.env.GEMINI_API_KEY);
    printColored("AI service initialized successfully.", colors.green);
  } catch (error) {
    printColored(`Error initializing AI service: ${error.message}`, colors.red);
    process.exit(1);
  }

  // Test parameters
  const testParams = {
    category: "Topic",
    topicName: "JavaScript Programming",
    numberOfQuestions: 2,
    difficulty: "medium",
    timePerQuestion: 30,
  };

  printColored(
    "\nGenerating quiz questions with the following parameters:",
    colors.cyan
  );
  console.log(JSON.stringify(testParams, null, 2));
  printColored("\nThis may take a few moments...\n", colors.yellow);

  try {
    // Generate questions
    const questions = await aiService.generateQuizQuestions(testParams);

    // Display results
    printColored(
      `Successfully generated ${questions.length} questions!`,
      colors.green
    );

    // Print each question
    questions.forEach((question, index) => {
      printColored(
        `\n--- Question ${index + 1} ---`,
        colors.bright + colors.cyan
      );
      printColored(`Question: ${question.text}`, colors.bright);

      // Print options
      printColored("\nOptions:", colors.yellow);
      question.options.forEach((option, optIndex) => {
        const prefix = option.isCorrect ? "✓" : " ";
        printColored(
          `${prefix} ${String.fromCharCode(65 + optIndex)}. ${option.text}`,
          option.isCorrect ? colors.green : colors.reset
        );
      });

      // Print explanation
      if (question.explanation) {
        printColored("\nExplanation:", colors.yellow);
        printColored(question.explanation, colors.reset);
      }

      printColored(`Time limit: ${question.timeLimit} seconds`, colors.cyan);
    });

    printColored(
      "\n=== Test completed successfully ===",
      colors.bright + colors.green
    );
  } catch (error) {
    printColored(`\nError generating questions: ${error.message}`, colors.red);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testAIGeneration().catch((error) => {
  printColored(`Unhandled error: ${error.message}`, colors.red);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
