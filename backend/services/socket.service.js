/**
 * Socket.io service for quiz-related real-time functionality
 */

let io;

// Store active quiz data in memory for quick access
// Make it global so it can be accessed by other modules
global.activeQuizzes = new Map();

/**
 * Initialize Socket.io instance
 * @param {Object} socketIo - Socket.io instance
 */
const initialize = (socketIo) => {
  io = socketIo;

  console.log("Socket.io initialized successfully");

  // Set up event handlers once io is initialized
  setupEventHandlers();
};

/**
 * Set up socket event handlers
 */
const setupEventHandlers = () => {
  if (!io) {
    console.error(
      "Failed to set up event handlers: Socket.io instance is not initialized"
    );
    return;
  }

  console.log("Setting up Socket.io event handlers");

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    console.log("Socket query parameters:", socket.handshake.query);

    // Send a connection acknowledgment to the client
    socket.emit("connection_acknowledged", {
      socketId: socket.id,
      message: "Successfully connected to socket server",
    });

    // Quiz room events
    handleQuizRoomEvents(socket);

    // Live quiz events
    handleLiveQuizEvents(socket);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Log any errors that occur on this socket
    socket.on("error", (error) => {
      console.error("Socket error for client", socket.id, ":", error);
    });
  });

  console.log("Socket.io event handlers setup complete");
};

/**
 * Handle quiz room related socket events
 * @param {Object} socket - Socket instance
 */
const handleQuizRoomEvents = (socket) => {
  // Join a quiz waiting room
  socket.on("join-quiz-room", async (data) => {
    console.log("Received join-quiz-room event from client", socket.id);

    const { quizId, userId, username } = data;
    console.log(
      `User ${username} (${userId}) attempting to join quiz ${quizId}`
    );

    if (!quizId) {
      console.error("Quiz ID is missing in join-quiz-room event");
      socket.emit("error", { message: "Quiz ID is required" });
      return;
    }

    // Join the room
    socket.join(`quiz:${quizId}`);

    // Store user data in socket for easy access
    socket.quizData = {
      quizId,
      userId,
      username,
    };

    // Notify others in the room
    socket.to(`quiz:${quizId}`).emit("user-joined", {
      userId,
      username,
      timestamp: new Date(),
    });

    // Confirm to the user that they joined
    socket.emit("joined-quiz-room", {
      quizId,
      success: true,
    });

    // Get the updated participants list from the database and broadcast to all users
    try {
      console.log(`Fetching updated participants list for quiz ${quizId}`);
      const Quiz = require("../models/quiz.model");
      const quiz = await Quiz.findById(quizId).populate(
        "participants.user",
        "username"
      );

      if (quiz) {
        // Format participants data
        const participantsList = quiz.participants
          .filter((p) => p.status !== "left")
          .map((p) => ({
            userId: p.user._id,
            username: p.user.username,
            joinedAt: p.joinedAt,
            status: p.status,
          }));

        console.log(
          `Broadcasting participants-updated event with ${participantsList.length} participants for quiz ${quizId}`
        );

        // Broadcast updated participants list to all users in the room
        io.to(`quiz:${quizId}`).emit("participants-updated", {
          participants: participantsList,
        });
      } else {
        console.error(
          `Quiz ${quizId} not found when trying to broadcast participants list`
        );
      }
    } catch (error) {
      console.error(
        `Error broadcasting participants list for quiz ${quizId}: ${error.message}`
      );
      console.error(error.stack);
    }

    console.log(`User ${userId} joined quiz room ${quizId}`);
  });

  // Leave a quiz room
  socket.on("leave-quiz-room", async (data) => {
    console.log("Received leave-quiz-room event from client", socket.id);

    const { quizId, userId, username } = data;
    console.log(
      `User ${username} (${userId}) attempting to leave quiz ${quizId}`
    );

    if (quizId) {
      socket.leave(`quiz:${quizId}`);
      console.log(`Socket ${socket.id} left room quiz:${quizId}`);

      // Update participant status in database
      try {
        console.log(
          `Updating participant status in database for user ${userId} in quiz ${quizId}`
        );
        const Quiz = require("../models/quiz.model");
        const quiz = await Quiz.findById(quizId);

        if (quiz) {
          // Find the participant and update their status to 'left'
          const participantIndex = quiz.participants.findIndex(
            (p) =>
              p.user.toString() === userId.toString() && p.status !== "left"
          );

          if (participantIndex !== -1) {
            quiz.participants[participantIndex].status = "left";
            await quiz.save();
            console.log(
              `Updated participant ${userId} status to 'left' in quiz ${quizId}`
            );

            // After updating the database, get the updated participants list and broadcast it
            try {
              const updatedQuiz = await Quiz.findById(quizId).populate(
                "participants.user",
                "username"
              );

              if (updatedQuiz) {
                const participantsList = updatedQuiz.participants
                  .filter((p) => p.status !== "left")
                  .map((p) => ({
                    userId: p.user._id,
                    username: p.user.username,
                    joinedAt: p.joinedAt,
                    status: p.status,
                  }));

                console.log(
                  `Broadcasting updated participants list after user left: ${participantsList.length} participants`
                );
                io.to(`quiz:${quizId}`).emit("participants-updated", {
                  participants: participantsList,
                });
              }
            } catch (error) {
              console.error(
                `Error broadcasting updated participants list after user left: ${error.message}`
              );
            }
          } else {
            console.log(
              `Participant ${userId} not found or already marked as left in quiz ${quizId}`
            );
          }
        } else {
          console.error(
            `Quiz ${quizId} not found when updating participant status`
          );
        }
      } catch (error) {
        console.error(`Error updating participant status: ${error.message}`);
        console.error(error.stack);
      }

      // Notify others
      console.log(
        `Emitting user-left event for ${username} (${userId}) in quiz ${quizId}`
      );
      socket.to(`quiz:${quizId}`).emit("user-left", {
        userId,
        username,
        timestamp: new Date(),
      });

      console.log(`User ${username} (${userId}) left quiz room ${quizId}`);

      // Clean up socket data
      delete socket.quizData;
    } else {
      console.error("Missing quizId in leave-quiz-room event");
    }
  });
};

/**
 * Emit event to all clients in a quiz room
 * @param {string} quizId - Quiz ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToQuizRoom = (quizId, event, data) => {
  if (!io) {
    console.error(
      `Failed to emit ${event} to quiz:${quizId}: Socket.io instance is not initialized`
    );
    return;
  }

  console.log(`Emitting ${event} event to quiz:${quizId}`);
  io.to(`quiz:${quizId}`).emit(event, data);
  console.log(`Emitted ${event} event to quiz:${quizId}`);
};

/**
 * Notify waiting room participants about quiz creation
 * @param {Object} quiz - Quiz object
 */
const notifyQuizCreated = (quiz) => {
  if (!io) return;

  // Broadcast to anyone who might be listening
  io.emit("quiz-created", {
    quizId: quiz._id,
    title: quiz.title,
    creator: quiz.creator,
    scheduledFor: quiz.scheduledFor,
  });

  console.log(`Notified about quiz creation: ${quiz._id}`);
};

/**
 * Notify waiting room participants that a quiz has started
 * @param {Object} quiz - Quiz object
 */
const notifyQuizStarted = (quiz) => {
  if (!io) return;

  // Initialize quiz data in memory
  initializeActiveQuiz(quiz);

  emitToQuizRoom(quiz._id, "quiz-started", {
    quizId: quiz._id,
    title: quiz.title,
    startTime: new Date(),
    totalTimeLimit: quiz.totalTimeLimit,
    totalQuestions: quiz.questions.length,
  });

  // Send the first question after a short delay
  setTimeout(() => {
    sendNextQuestion(quiz._id);
  }, 3000); // 3 seconds delay to allow clients to prepare

  console.log(`Notified about quiz start: ${quiz._id}`);
};

/**
 * Notify participants that a quiz has completed
 * @param {Object} quiz - Quiz object
 */
const notifyQuizCompleted = async (quiz) => {
  if (!io) return;

  console.log("GLOBAL DATA BEFORE FINAL STAT: ", global);

  // Get final statistics
  const quizData = global.activeQuizzes.get(quiz._id.toString());
  const finalStats = quizData ? quizData.statistics : {};

  try {
    // Generate leaderboard
    const Result = require("../models/result.model");
    const leaderboard = await Result.find({
      quiz: quiz._id,
      status: "completed",
    })
      .populate("user", "username")
      .sort({ totalScore: -1, completedAt: 1 })
      .limit(20)
      .lean();

    // Format leaderboard data
    const formattedLeaderboard = leaderboard.map((result, index) => ({
      rank: index + 1,
      userId: result.user._id,
      username: result.user.username,
      score: result.totalScore,
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      percentageScore: result.percentageScore,
    }));

    // Add leaderboard to final stats
    finalStats.leaderboard = formattedLeaderboard;

    console.log("FINAL STAT: ", finalStats);

    // Prepare questions with correct answers and explanations
    const questionsWithAnswers = quiz.questions.map((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);
      return {
        text: question.text,
        options: question.options,
        correctOptionId: correctOption ? correctOption._id : null,
        explanation: question.explanation || "",
      };
    });

    // Emit quiz completed event with leaderboard and questions with answers
    emitToQuizRoom(quiz._id, "quiz-completed", {
      quizId: quiz._id,
      completionTime: new Date(),
      statistics: finalStats,
      questionsWithAnswers: questionsWithAnswers,
    });

    // Update quiz status in database
    const Quiz = require("../models/quiz.model");
    await Quiz.findByIdAndUpdate(quiz._id, { status: "completed" });

    console.log(`Notified about quiz completion with leaderboard: ${quiz._id}`);
  } catch (error) {
    console.error(`Error generating leaderboard for quiz ${quiz._id}:`, error);

    // Prepare questions with correct answers and explanations even if leaderboard fails
    const questionsWithAnswers = quiz.questions.map((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);
      return {
        text: question.text,
        options: question.options,
        correctOptionId: correctOption ? correctOption._id : null,
        explanation: question.explanation || "",
      };
    });

    // Still emit the event even if leaderboard generation fails
    emitToQuizRoom(quiz._id, "quiz-completed", {
      quizId: quiz._id,
      completionTime: new Date(),
      statistics: finalStats,
      questionsWithAnswers: questionsWithAnswers,
    });
  }

  // Clean up quiz data from memory
  global.activeQuizzes.delete(quiz._id.toString());
};

/**
 * Initialize active quiz data in memory
 * @param {Object} quiz - Quiz object
 */
const initializeActiveQuiz = (quiz) => {
  const quizId = quiz._id.toString();

  // Store quiz data in memory for quick access
  global.activeQuizzes.set(quizId, {
    quiz: quiz,
    currentQuestionIndex: -1, // Start with -1, will be incremented to 0 when first question is sent
    participants: {},
    answers: {},
    currentCorrectOptionId: null, // Will store the current question's correct option ID
    currentExplanation: "", // Will store the current question's explanation
    statistics: {
      totalParticipants: quiz.participants.length,
      answeredCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      percentCorrect: 0,
      percentIncorrect: 0,
    },
    questionStatistics: [],
  });
};

/**
 * Send the next question to all participants
 * @param {string} quizId - Quiz ID
 */
const sendNextQuestion = (quizId) => {
  const quizData = global.activeQuizzes.get(quizId.toString());

  if (!quizData) return;

  // Increment to next question
  quizData.currentQuestionIndex++;

  // Check if we've reached the end of questions
  if (quizData.currentQuestionIndex >= quizData.quiz.questions.length) {
    // No more questions, quiz is complete
    notifyQuizCompleted(quizData.quiz);
    return;
  }

  const questionIndex = quizData.currentQuestionIndex;
  const question = quizData.quiz.questions[questionIndex];

  // Reset statistics for this question
  quizData.statistics.answeredCount = 0;
  quizData.statistics.correctCount = 0;
  quizData.statistics.incorrectCount = 0;
  quizData.statistics.percentCorrect = 0;
  quizData.statistics.percentIncorrect = 0;

  // Find the correct option
  const correctOption = question.options.find((option) => option.isCorrect);

  // Store the correct option ID for later use when the question ends
  quizData.currentCorrectOptionId = correctOption ? correctOption._id : null;
  quizData.currentExplanation = question.explanation || "";

  // Prepare question data (without correct answer)
  const questionData = {
    quizId: quizId,
    questionIndex: questionIndex,
    questionNumber: questionIndex + 1,
    totalQuestions: quizData.quiz.questions.length,
    text: question.text,
    options: question.options.map((option) => ({
      _id: option._id,
      text: option.text,
    })),
    timeLimit: question.timeLimit,
    points: question.points,
  };

  // Send question to all participants
  emitToQuizRoom(quizId, "quiz-question", questionData);

  // Initialize question statistics
  quizData.questionStatistics[questionIndex] = {
    answeredCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    percentCorrect: 0,
    percentIncorrect: 0,
  };

  // Schedule the next question after the time limit
  setTimeout(() => {
    // Send only the statistics, not the correct answer or explanation
    emitToQuizRoom(quizId, "question-ended", {
      quizId: quizId,
      questionIndex: questionIndex,
      statistics: quizData.questionStatistics[questionIndex],
      currentQuestionIndex: quizData.currentQuestionIndex,
    });

    // Wait 5 seconds before sending the next question
    setTimeout(() => {
      sendNextQuestion(quizId);
    }, 5000);
  }, question.timeLimit * 1000);

  console.log(`Sent question ${questionIndex + 1} for quiz ${quizId}`);
};

/**
 * Handle live quiz events
 * @param {Object} socket - Socket instance
 */
const handleLiveQuizEvents = (socket) => {
  // Handle answer submission
  socket.on("submit-answer", async (data) => {
    const { quizId, questionIndex, optionId } = data;
    const userId = socket.quizData?.userId;
    const username = socket.quizData?.username;

    if (!quizId || questionIndex === undefined || !optionId || !userId) {
      socket.emit("error", { message: "Invalid answer submission" });
      return;
    }

    // Get quiz data
    const quizData = global.activeQuizzes.get(quizId.toString());

    if (!quizData || quizData.currentQuestionIndex !== questionIndex) {
      socket.emit("error", { message: "Question is no longer active" });
      return;
    }

    // Check if user already answered this question
    const answerKey = `${quizId}-${questionIndex}-${userId}`;
    if (quizData.answers[answerKey]) {
      socket.emit("error", {
        message: "You have already answered this question",
      });
      return;
    }

    // Get the question and check if the answer is correct
    const question = quizData.quiz.questions[questionIndex];
    const selectedOption = question.options.find(
      (option) => option._id.toString() === optionId.toString()
    );

    if (!selectedOption) {
      socket.emit("error", { message: "Invalid option selected" });
      return;
    }

    const isCorrect = selectedOption.isCorrect;
    const points = isCorrect ? question.points : 0;

    // Store the answer
    const timestamp = new Date();
    quizData.answers[answerKey] = {
      userId,
      optionId,
      isCorrect,
      points,
      timestamp,
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

    // Store result in database
    try {
      const Result = require("../models/result.model");

      // Find or create result document
      let result = await Result.findOne({ quiz: quizId, user: userId });

      if (!result) {
        result = new Result({
          quiz: quizId,
          user: userId,
          answers: [],
          totalScore: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          status: "in-progress",
        });
      }

      // Add this answer
      result.answers.push({
        questionIndex,
        selectedOption: optionId,
        isCorrect,
        points,
        submittedAt: timestamp,
      });

      // Update totals
      if (isCorrect) {
        result.totalScore += points;
        result.correctAnswers += 1;
      } else {
        result.incorrectAnswers += 1;
      }

      // Check if this was the last question
      if (questionIndex === quizData.quiz.questions.length - 1) {
        result.status = "completed";
        result.completedAt = timestamp;
      }

      // Update final result
      result.status = "completed";
      await result.save();
      console.log(
        `Saved result for user ${userId} on question ${
          questionIndex + 1
        } in quiz ${quizId}`
      );
    } catch (error) {
      console.error(
        `Error saving result for user ${userId} on question ${
          questionIndex + 1
        }:`,
        error
      );
    }

    // Acknowledge the answer
    socket.emit("answer-received", {
      quizId,
      questionIndex,
      received: true,
      isCorrect,
      points,
    });

    // Broadcast updated statistics to all participants
    emitToQuizRoom(quizId, "statistics-update", {
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
  });
};

module.exports = {
  initialize,
  emitToQuizRoom,
  notifyQuizCreated,
  notifyQuizStarted,
  notifyQuizCompleted,
  sendNextQuestion,
};
