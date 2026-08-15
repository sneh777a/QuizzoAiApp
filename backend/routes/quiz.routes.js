const express = require("express");
const {
  createQuiz,
  joinQuiz,
  startQuiz,
  submitAnswer,
  getCurrentQuestion,
  getUserQuizStats,
  getCompletedQuizzes,
  getScheduledQuizzes,
} = require("../controllers/quiz.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { quizCreationLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

/**
 * @route POST /api/quiz/create
 * @desc Create a new quiz
 * @access Private
 */
router.post("/create", authMiddleware, quizCreationLimiter, createQuiz);

/**
 * @route POST /api/quiz/join
 * @desc Join a quiz waiting room
 * @access Private
 */
router.post("/join", authMiddleware, joinQuiz);

/**
 * @route POST /api/quiz/start/:id
 * @desc Start a quiz manually (admin or creator only)
 * @access Private
 */
router.post("/start/:id", authMiddleware, startQuiz);

/**
 * @route POST /api/quiz/submit-answer
 * @desc Submit an answer to a quiz question
 * @access Private
 */
router.post("/submit-answer", authMiddleware, submitAnswer);

/**
 * @route GET /api/quiz/user-stats
 * @desc Get quiz statistics for the current user
 * @access Private
 */
router.get("/user-stats", authMiddleware, getUserQuizStats);

/**
 * @route GET /api/quiz/completed
 * @desc Get all completed quizzes for the current user
 * @access Private
 */
router.get("/completed", authMiddleware, getCompletedQuizzes);

/**
 * @route GET /api/quiz/scheduled
 * @desc Get all scheduled quizzes for the current user
 * @access Private
 */
router.get("/scheduled", authMiddleware, getScheduledQuizzes);

/**
 * @route GET /api/quiz/:id/current-question
 * @desc Get the current question for a quiz
 * @access Private
 */
router.get("/:id/current-question", authMiddleware, getCurrentQuestion);

module.exports = router;
