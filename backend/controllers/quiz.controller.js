const Quiz = require("../models/quiz.model");
const User = require("../models/user.model");
const Result = require("../models/result.model");
const socketService = require("../services/socket.service");
const aiService = require("../services/ai.service");
const schedulerService = require("../services/scheduler.service");
const mongoose = require("mongoose");

/**
 * Get user quiz statistics
 * @route GET /api/quiz/user-stats
 * @access Private
 */
exports.getUserQuizStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all completed quiz results for the user
    const results = await Result.find({
      user: userId,
      status: "completed",
    })
      .populate([
        {
          path: "quiz",
          populate: {
            path: "questions",
          },
        },
      ])
      .sort({ completedAt: -1 })
      .lean({ virtuals: true }); // Include virtuals with lean query

    // Calculate statistics
    const quizzesTaken = results.length;

    // Calculate average score manually
    let totalScore = 0;
    results.forEach((result) => {
      // Calculate percentage score manually: (correctAnswers / totalAnswers) * 100
      const totalAnswers = result.answers?.length || 0;
      const percentageScore =
        totalAnswers > 0
          ? Math.round((result.correctAnswers / totalAnswers) * 100)
          : 0;
      totalScore += percentageScore;
    });
    const averageScore =
      quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

    console.log(
      "Results with scores:",
      results.map((r) => ({
        id: r._id,
        correctAnswers: r.correctAnswers,
        totalAnswers: r.answers?.length,
        calculatedScore:
          r.answers?.length > 0
            ? Math.round((r.correctAnswers / r.answers.length) * 100)
            : 0,
      }))
    );

    // Format recent activity (last 5 quizzes) with manually calculated scores
    const recentActivity = results.map((result) => {
      // Calculate percentage score manually for each result
      const totalAnswers = result.answers?.length || 0;
      const percentageScore =
        totalAnswers > 0
          ? Math.round((result.correctAnswers / totalAnswers) * 100)
          : 0;

      return {
        quizId: result.quiz._id,
        quizTitle: result.quiz.title,
        topicName: result.quiz.topicName,
        score: percentageScore,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        completedAt: result.completedAt,
        noOfQuestions: result.quiz.questions.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          quizzesTaken,
          averageScore,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new quiz
 * @route POST /api/quiz/create
 * @access Private
 */
exports.createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      topicDescription,
      category,
      topicName,
      numberOfQuestions,
      difficulty,
      timePerQuestion,
      scheduledFor,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !topicName ||
      !category ||
      !numberOfQuestions ||
      !difficulty ||
      !timePerQuestion ||
      !scheduledFor
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create new quiz
    const quiz = new Quiz({
      title,
      topicDescription,
      creator: req.user._id,
      category,
      topicName,
      difficulty,
      status: "scheduled",
      scheduledFor: new Date(scheduledFor),
      // Initialize with empty questions array
      // Questions will be generated and added later
      questions: [],
      // Calculate total time limit based on number of questions and time per question
      totalTimeLimit: numberOfQuestions * timePerQuestion,
    });

    // Generate quiz questions using AI service
    try {
      console.log(
        `Quiz controller: Requesting ${numberOfQuestions} questions for quiz "${title}"`
      );
      console.log(
        `Quiz parameters: category=${category}, topicName=${topicName}, difficulty=${difficulty}`
      );

      const quizParams = {
        category,
        topicName,
        topicDescription,
        numberOfQuestions: parseInt(numberOfQuestions),
        difficulty,
        timePerQuestion: parseInt(timePerQuestion),
      };

      console.log(
        "Quiz controller: Sending parameters to AI service:",
        JSON.stringify(quizParams, null, 2)
      );

      const generatedQuestions = await aiService.generateQuizQuestions(
        quizParams
      );

      console.log(
        `Quiz controller: Received ${generatedQuestions.length} questions from AI service`
      );

      // Add generated questions to the quiz
      quiz.questions = generatedQuestions;

      console.log(
        `Quiz controller: Final question count in quiz: ${quiz.questions.length}`
      );
    } catch (error) {
      console.error("Failed to generate quiz questions:", error);
      // Continue with empty questions array if generation fails
      // Questions can be added manually later
    }

    // Save quiz to database
    await quiz.save();

    // Notify connected clients about the new quiz via socket.io
    socketService.notifyQuizCreated(quiz);

    // Return quiz data
    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: {
        quizId: quiz._id,
        title: quiz.title,
        scheduledFor: quiz.scheduledFor,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a quiz waiting room
 * @route POST /api/quiz/join
 * @access Private
 */
exports.joinQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;

    // First, we find the quiz and populate important user details
    const quiz = await Quiz.findById(quizId)
      .populate("creator", "username email") // Get creator's details
      .populate("participants.user", "username email"); // Get all participants' details

    // Various checks
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check quiz status - users can't join after quiz has started
    if (
      quiz.status === "active" ||
      quiz.status === "completed" ||
      quiz.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot join quiz that has status: ${quiz.status}. Only scheduled quizzes can be joined.`,
      });
    }

    // Check if quiz is about to start (within 10 seconds)
    const now = new Date();
    const scheduledTime = new Date(quiz.scheduledFor);
    const timeUntilStart = scheduledTime - now;

    if (timeUntilStart <= 10000 && timeUntilStart > 0) {
      // 10 seconds or less until start
      return res.status(400).json({
        success: false,
        message:
          "Cannot join quiz that is about to start in less than 10 seconds",
      });
    }

    // Check if participant exists and update their status
    const existingParticipantIndex = quiz.participants.findIndex(
      (p) => p.user.toString() === userId.toString()
    );

    if (existingParticipantIndex === -1) {
      // Add new participant if not found
      quiz.participants.push({
        user: userId,
        status: "waiting",
        joinedAt: new Date(),
      });
    } else {
      // Update existing participant's status and joinedAt time
      quiz.participants[existingParticipantIndex].status = "waiting";
      quiz.participants[existingParticipantIndex].joinedAt = new Date();
    }

    await quiz.save();

    // Prepare waiting room data
    const waitingRoomData = {
      quizId: quiz._id,
      title: quiz.title,
      topicDescription: quiz.topicDescription,
      creator: quiz.creator, // Creator's name as required
      category: quiz.category, // Quiz topic as required
      topicName: quiz.topicName, // Sub-topics as required
      scheduledFor: quiz.scheduledFor, // Start time as required
      difficulty: quiz.difficulty,
      totalTimeLimit: quiz.totalTimeLimit,
      participants: quiz.participants.map((p) => ({
        username: p.user.username, // List of users with names as required
        joinedAt: p.joinedAt,
        status: p.status,
      })),
      status: quiz.status,
    };

    // Emit socket event for real-time updates
    socketService.emitToQuizRoom(quizId, "quiz-participant-joined", {
      userId: userId,
      username: req.user.username,
      joinedAt: new Date(),
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Successfully joined quiz waiting room",
      data: waitingRoomData,
    });
  } catch (error) {
    next(error);
  }
};

// When a user connects to the socket
const handleQuizRoomEvents = (socket) => {
  // Join a quiz waiting room
  socket.on("join-quiz-room", (data) => {
    const { quizId, userId, username } = data;

    // Join the socket room
    socket.join(`quiz:${quizId}`);

    // Notify others in the room about new participant
    socket.to(`quiz:${quizId}`).emit("user-joined", {
      userId,
      username,
      timestamp: new Date(),
    });

    // Confirm join to the user
    socket.emit("joined-quiz-room", {
      quizId,
      success: true,
    });
  });

  // Handle user leaving
  socket.on("leave-quiz-room", (data) => {
    const { quizId, userId, username } = data;

    if (quizId) {
      socket.leave(`quiz:${quizId}`);

      // Notify others about user leaving
      socket.to(`quiz:${quizId}`).emit("user-left", {
        userId,
        username,
        timestamp: new Date(),
      });
    }
  });
};

/**
 * Start a quiz manually (can also be triggered by scheduler)
 * @route POST /api/quiz/start/:id
 * @access Private (Admin or Creator only)
 */
exports.startQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is authorized (creator or admin)
    if (
      quiz.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to start this quiz",
      });
    }

    // Check if quiz can be started
    if (quiz.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Quiz cannot be started. Current status: ${quiz.status}`,
      });
    }

    // Use the scheduler service to start the quiz
    await schedulerService.startQuiz(quiz);

    res.status(200).json({
      success: true,
      message: "Quiz started successfully",
      data: {
        quizId: quiz._id,
        title: quiz.title,
        status: "active",
        startTime: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit an answer to a quiz question
 * @route POST /api/quiz/submit-answer
 * @access Private
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { quizId, questionIndex, optionId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!quizId || questionIndex === undefined || !optionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide quizId, questionIndex, and optionId",
      });
    }

    // Find the quiz
    const quiz = await Quiz.findById(quizId);

    // Check if quiz exists and is active
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Cannot submit answer. Quiz status: ${quiz.status}`,
      });
    }

    // Check if question exists
    if (!quiz.questions[questionIndex]) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if option exists
    const question = quiz.questions[questionIndex];
    const selectedOption = question.options.find(
      (option) => option._id.toString() === optionId.toString()
    );

    if (!selectedOption) {
      return res.status(404).json({
        success: false,
        message: "Option not found",
      });
    }

    // Check if user is a participant
    const isParticipant = quiz.participants.some(
      (p) => p.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this quiz",
      });
    }

    // Create answer object
    const answerData = {
      quizId: quizId,
      questionIndex: questionIndex,
      optionId: optionId,
      userId: userId,
    };

    // Use socket service to process the answer (same logic as socket-based submission)
    // This is a workaround for clients that might have socket connection issues
    const result = await processAnswer(answerData, req.user.username);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        isCorrect: result.isCorrect,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current question for a quiz
 * @route GET /api/quiz/:id/current-question
 * @access Private
 */
exports.getCurrentQuestion = async (req, res, next) => {
  try {
    const quizId = req.params.id;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);

    // Check if quiz exists and is active
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Cannot get current question. Quiz status: ${quiz.status}`,
      });
    }

    // Get current question index from socket service
    const quizData = global.activeQuizzes?.get(quizId.toString());

    if (!quizData) {
      return res.status(404).json({
        success: false,
        message: "Quiz data not found",
      });
    }

    const questionIndex = quizData.currentQuestionIndex;

    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return res.status(404).json({
        success: false,
        message: "No active question",
      });
    }

    const question = quiz.questions[questionIndex];

    // Prepare question data (without correct answer)
    const questionData = {
      quizId: quizId,
      questionIndex: questionIndex,
      questionNumber: questionIndex + 1,
      totalQuestions: quiz.questions.length,
      text: question.text,
      options: question.options.map((option) => ({
        _id: option._id,
        text: option.text,
      })),
      timeLimit: question.timeLimit,
      points: question.points,
      statistics: quizData.questionStatistics[questionIndex],
    };

    res.status(200).json({
      success: true,
      data: questionData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process an answer submission (used by both socket and REST API)
 * @param {Object} answerData - Answer data
 * @param {string} username - Username
 * @returns {Object} - Result object
 */
const processAnswer = async (answerData, username) => {
  const { quizId, questionIndex, optionId, userId } = answerData;

  // Get quiz data from memory
  const quizData = global.activeQuizzes?.get(quizId.toString());

  if (!quizData || quizData.currentQuestionIndex !== questionIndex) {
    return {
      success: false,
      message: "Question is no longer active",
    };
  }

  // Check if user already answered this question
  const answerKey = `${quizId}-${questionIndex}-${userId}`;
  if (quizData.answers[answerKey]) {
    return {
      success: false,
      message: "You have already answered this question",
    };
  }

  // Get the question and check if the answer is correct
  const question = quizData.quiz.questions[questionIndex];
  const selectedOption = question.options.find(
    (option) => option._id.toString() === optionId.toString()
  );

  if (!selectedOption) {
    return {
      success: false,
      message: "Invalid option selected",
    };
  }

  const isCorrect = selectedOption.isCorrect;

  // Store the answer
  quizData.answers[answerKey] = {
    userId,
    optionId,
    isCorrect,
    timestamp: new Date(),
  };

  // Update statistics
  quizData.statistics.answeredCount++;
  quizData.questionStatistics[questionIndex].answeredCount++;

  if (isCorrect) {
    quizData.statistics.correctCount++;
    quizData.questionStatistics[questionIndex].correctCount++;
  } else {
    quizData.statistics.incorrectCount++;
    quizData.questionStatistics[questionIndex].incorrectCount++;
  }

  // Calculate percentages
  const totalAnswered =
    quizData.questionStatistics[questionIndex].answeredCount;
  if (totalAnswered > 0) {
    quizData.questionStatistics[questionIndex].percentCorrect = Math.round(
      (quizData.questionStatistics[questionIndex].correctCount /
        totalAnswered) *
        100
    );
    quizData.questionStatistics[questionIndex].percentIncorrect = Math.round(
      (quizData.questionStatistics[questionIndex].incorrectCount /
        totalAnswered) *
        100
    );
  }

  // Broadcast updated statistics to all participants
  socketService.emitToQuizRoom(quizId, "statistics-update", {
    quizId,
    questionIndex,
    totalParticipants: quizData.statistics.totalParticipants,
    answeredCount: quizData.questionStatistics[questionIndex].answeredCount,
    percentCorrect: quizData.questionStatistics[questionIndex].percentCorrect,
    percentIncorrect:
      quizData.questionStatistics[questionIndex].percentIncorrect,
  });

  console.log(
    `User ${userId} submitted answer for question ${
      questionIndex + 1
    } in quiz ${quizId}`
  );

  return {
    success: true,
    isCorrect,
  };
};

/**
 * Get all completed quizzes for the current user
 * @route GET /api/quiz/completed
 * @access Private
 */
exports.getCompletedQuizzes = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all results where the user has completed quizzes
    const results = await Result.find({
      user: userId,
      status: "completed",
    })
      .populate({
        path: "quiz",
        select:
          "title topicName questions difficulty totalTimeLimit scheduledFor",
      })
      .sort({ completedAt: -1 })
      .lean({ virtuals: true });

    // Format the response data
    const completedQuizzes = results.map((result) => {
      // Calculate percentage score
      const totalAnswers = result.answers?.length || 0;
      const percentageScore =
        totalAnswers > 0
          ? Math.round((result.correctAnswers / totalAnswers) * 100)
          : 0;

      return {
        quizId: result.quiz._id,
        topicName: result.quiz.topicName,
        numberOfQuestions: result.quiz.questions.length,
        difficulty: result.quiz.difficulty,
        totalTimeLimit: result.quiz.totalTimeLimit,
        scheduledFor: result.quiz.scheduledFor,
        totalScore: percentageScore,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        createdAt: result.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: completedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all scheduled quizzes for the current user
 * @route GET /api/quiz/scheduled
 * @access Private
 */
exports.getScheduledQuizzes = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all quizzes where status is scheduled and user is a participant
    const scheduledQuizzes = await Quiz.find({
      status: "scheduled",
      "participants.user": userId,
    })
      .select("_id topicName questions difficulty totalTimeLimit scheduledFor")
      .sort({ scheduledFor: 1 })
      .lean({ virtuals: true });

    // Format the response data
    const formattedQuizzes = scheduledQuizzes.map((quiz) => {
      return {
        quizId: quiz._id,
        topicName: quiz.topicName,
        numberOfQuestions: quiz.questions.length,
        difficulty: quiz.difficulty,
        totalTimeLimit: quiz.totalTimeLimit,
        scheduledFor: quiz.scheduledFor,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};
