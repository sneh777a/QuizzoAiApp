/**
 * Test script for the my-scheduled-quizzes API endpoint
 * 
 * This script demonstrates how to call the API and handle the response
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.argv[2]; // Pass token as command line argument

if (!TOKEN) {
  console.error('Please provide a valid JWT token as a command line argument');
  console.error('Usage: node test-my-scheduled-quizzes.js <jwt_token>');
  process.exit(1);
}

async function testMyScheduledQuizzes() {
  try {
    console.log('Testing my-scheduled-quizzes API endpoint...');
    
    // Make the API request
    const response = await axios.get(`${API_URL}/quiz/my-scheduled-quizzes`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    
    // Check if the request was successful
    if (response.data.success) {
      console.log('API call successful!');
      console.log('\nScheduled Quizzes:');
      
      // Display the quizzes in a table format
      if (response.data.data.length === 0) {
        console.log('No scheduled quizzes found.');
      } else {
        console.table(response.data.data.map(quiz => ({
          'Quiz ID': quiz.quizId,
          'Title': quiz.title,
          'Topic': quiz.topicName,
          'Questions': quiz.numberOfQuestions,
          'Difficulty': quiz.difficulty,
          'Time Limit': `${Math.floor(quiz.totalTimeLimit / 60)}m ${quiz.totalTimeLimit % 60}s`,
          'Scheduled For': new Date(quiz.scheduledFor).toLocaleString()
        })));
      }
    } else {
      console.error('API call failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error calling API:', error.response?.data?.message || error.message);
  }
}

// Run the test
testMyScheduledQuizzes();