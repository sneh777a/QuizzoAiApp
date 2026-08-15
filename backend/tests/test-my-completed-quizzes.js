/**
 * Test script for the My Completed Quizzes API endpoint
 * 
 * Usage: node test-my-completed-quizzes.js <jwt_token>
 */

const axios = require('axios');
const Table = require('cli-table');

// Get JWT token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a JWT token as a command line argument');
  console.error('Usage: node test-my-completed-quizzes.js <jwt_token>');
  process.exit(1);
}

// API endpoint URL
const API_URL = 'http://localhost:5000/api/quiz/my-completed-quizzes';

// Function to test the API
async function testMyCompletedQuizzes() {
  try {
    console.log('Testing My Completed Quizzes API...');
    console.log(`GET ${API_URL}`);
    console.log('Authorization: Bearer <token>');
    
    // Make the API request
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check if the request was successful
    if (response.status === 200 && response.data.success) {
      const quizzes = response.data.data;
      
      if (quizzes.length === 0) {
        console.log('\nNo completed quizzes found.');
        return;
      }
      
      // Create a table to display the results
      const table = new Table({
        head: ['Topic Name', 'Questions', 'Difficulty', 'Time Limit', 'Score', 'Correct', 'Incorrect', 'Completed At'],
        colWidths: [25, 10, 12, 12, 10, 10, 10, 30]
      });
      
      // Add each quiz to the table
      quizzes.forEach(quiz => {
        table.push([
          quiz.topicName || 'N/A',
          quiz.numberOfQuestions || 'N/A',
          quiz.difficulty || 'N/A',
          quiz.totalTimeLimit ? `${quiz.totalTimeLimit}s` : 'N/A',
          quiz.totalScore || 'N/A',
          quiz.correctAnswers || 'N/A',
          quiz.incorrectAnswers || 'N/A',
          new Date(quiz.completedAt).toLocaleString() || 'N/A'
        ]);
      });
      
      // Display the table
      console.log('\nCompleted Quizzes:');
      console.log(table.toString());
      console.log(`\nTotal: ${quizzes.length} completed quiz(es)`);
    } else {
      console.error('\nError: Unexpected response format');
      console.error(response.data);
    }
  } catch (error) {
    console.error('\nError testing My Completed Quizzes API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testMyCompletedQuizzes();