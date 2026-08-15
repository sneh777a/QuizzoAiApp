/**
 * Scheduler service for automating quiz-related tasks
 * Uses node-cron to schedule and run tasks at specified intervals
 */

const cron = require('node-cron');
const Quiz = require('../models/quiz.model');
const socketService = require('./socket.service');

let scheduledTasks = {};

/**
 * Initialize the scheduler service
 */
const initialize = () => {
  console.log('Initializing scheduler service...');
  
  // Schedule the main task to check for quizzes that need to be started
  // This runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      await checkScheduledQuizzes();
    } catch (error) {
      console.error('Error in scheduled quiz check:', error);
    }
  });
  
  console.log('Scheduler service initialized');
};

/**
 * Check for quizzes that are scheduled to start now
 */
const checkScheduledQuizzes = async () => {
  const now = new Date();
  
  // Find quizzes that are scheduled to start within the next minute
  // and are currently in 'scheduled' status
  const quizzesToStart = await Quiz.find({
    status: 'scheduled',
    scheduledFor: {
      $lte: new Date(now.getTime() + 60 * 1000), // Current time + 1 minute
      $gte: new Date(now.getTime() - 60 * 1000)  // Current time - 1 minute (to catch any missed ones)
    }
  });
  
  console.log(`Found ${quizzesToStart.length} quizzes to start`);
  
  // Start each quiz
  for (const quiz of quizzesToStart) {
    await startQuiz(quiz);
  }
};

/**
 * Start a scheduled quiz
 * @param {Object} quiz - Quiz document
 */
const startQuiz = async (quiz) => {
  try {
    console.log(`Starting quiz: ${quiz._id} - ${quiz.title}`);
    
    // Update quiz status to 'active'
    quiz.status = 'active';
    await quiz.save();
    
    // Notify all participants in the waiting room
    socketService.notifyQuizStarted(quiz);
    
    console.log(`Quiz started successfully: ${quiz._id}`);
    
    // Schedule the quiz to be automatically completed after the total time limit
    scheduleQuizCompletion(quiz);
    
  } catch (error) {
    console.error(`Error starting quiz ${quiz._id}:`, error);
  }
};

/**
 * Schedule a quiz to be automatically completed after its time limit
 * @param {Object} quiz - Quiz document
 */
const scheduleQuizCompletion = (quiz) => {
  // Cancel any existing completion task for this quiz
  if (scheduledTasks[quiz._id]) {
    clearTimeout(scheduledTasks[quiz._id]);
  }
  
  // Calculate when the quiz should end (current time + total time limit)
  const endTime = new Date(Date.now() + quiz.totalTimeLimit * 1000);
  const timeoutMs = quiz.totalTimeLimit * 1000; // Convert seconds to milliseconds
  
  // Schedule the completion task using setTimeout
  scheduledTasks[quiz._id] = setTimeout(async () => {
    try {
      await completeQuiz(quiz._id);
      // Remove the task from our tracking object
      delete scheduledTasks[quiz._id];
    } catch (error) {
      console.error(`Error completing quiz ${quiz._id}:`, error);
    }
  }, timeoutMs);
  
  console.log(`Scheduled quiz ${quiz._id} to complete at ${endTime} (in ${timeoutMs/1000} seconds)`);
};

/**
 * Complete a quiz after its time limit has expired
 * @param {string} quizId - Quiz ID
 */
const completeQuiz = async (quizId) => {
  try {
    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      console.error(`Quiz not found: ${quizId}`);
      return;
    }
    
    if (quiz.status === 'active') {
      // Update quiz status to 'completed'
      quiz.status = 'completed';
      await quiz.save();
      
      // Notify all participants
      socketService.notifyQuizCompleted(quiz);
      
      console.log(`Quiz completed: ${quizId}`);
    }
  } catch (error) {
    console.error(`Error completing quiz ${quizId}:`, error);
  }
};

module.exports = {
  initialize,
  startQuiz,
  completeQuiz
};