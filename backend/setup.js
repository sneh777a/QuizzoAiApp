/**
 * Setup script for the Live Quiz App backend
 * This script helps with installing dependencies and setting up the project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
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
 * Run a command and handle errors
 * @param {string} command - The command to run
 * @param {string} errorMessage - The error message to display if the command fails
 */
function runCommand(command, errorMessage) {
  try {
    printColored(`Running: ${command}`, colors.cyan);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    printColored(`${errorMessage}: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - The path to the file
 * @returns {boolean} - Whether the file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Create a file from a template
 * @param {string} templatePath - The path to the template file
 * @param {string} targetPath - The path to the target file
 * @param {Object} replacements - The replacements to make in the template
 */
function createFileFromTemplate(templatePath, targetPath, replacements = {}) {
  if (fileExists(targetPath)) {
    printColored(`File ${targetPath} already exists. Skipping.`, colors.yellow);
    return;
  }

  if (!fileExists(templatePath)) {
    printColored(`Template file ${templatePath} not found.`, colors.red);
    return;
  }

  let content = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with values
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  fs.writeFileSync(targetPath, content);
  printColored(`Created ${targetPath}`, colors.green);
}

/**
 * Main setup function
 */
async function setup() {
  printColored('\n=== Live Quiz App Backend Setup ===\n', colors.bright + colors.green);

  // Step 1: Install dependencies
  printColored('\nStep 1: Installing dependencies...', colors.bright);
  if (!runCommand('npm install', 'Failed to install dependencies')) {
    process.exit(1);
  }

  // Step 2: Create .env file if it doesn't exist
  printColored('\nStep 2: Setting up environment variables...', colors.bright);
  if (!fileExists('.env') && fileExists('.env.example')) {
    createFileFromTemplate('.env.example', '.env');
    printColored('Please update the .env file with your actual values.', colors.yellow);
  } else if (!fileExists('.env.example')) {
    printColored('No .env.example file found. Skipping environment setup.', colors.red);
  } else {
    printColored('.env file already exists. Skipping.', colors.yellow);
  }

  // Step 3: Check MongoDB connection
  printColored('\nStep 3: Checking MongoDB connection...', colors.bright);
  printColored('Make sure MongoDB is running and the connection string in .env is correct.', colors.yellow);

  // Step 4: Prompt for Gemini API key
  printColored('\nStep 4: Setting up Gemini API for quiz generation...', colors.bright);
  printColored('You need a Gemini API key for automatic quiz question generation.', colors.yellow);
  printColored('Get your API key from: https://aistudio.google.com/app/apikey', colors.cyan);
  printColored('Then add it to your .env file as GEMINI_API_KEY=your_key_here', colors.yellow);

  // Step 5: Final instructions
  printColored('\nSetup complete! To start the development server, run:', colors.bright + colors.green);
  printColored('npm run dev', colors.cyan);
  printColored('\nFor more information, check the README.md file.', colors.bright);

  rl.close();
}

// Run the setup
setup().catch(error => {
  printColored(`Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});