import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import io from "socket.io-client";

const ActiveQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for quiz data
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [statistics, setStatistics] = useState({
    totalParticipants: 0,
    answeredCount: 0,
    percentCorrect: 0,
    percentIncorrect: 0,
  });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState("");

  // Initialize socket connection
  useEffect(() => {
    if (!quizId || !user) return;

    console.log("Initializing socket connection for active quiz...");

    // Connect to socket server
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { token: localStorage.getItem("token") },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Connected to socket server with ID:", newSocket.id);

      // Join the quiz room after connection
      newSocket.emit("join-quiz-room", {
        quizId,
        userId: user._id,
        username: user.username,
      });
      console.log(`Emitted join-quiz-room event for quiz ${quizId}`);
    });

    // Listen for connection acknowledgment
    newSocket.on("connection_acknowledged", (data) => {
      console.log("Connection acknowledged by server:", data);
    });

    // Listen for quiz question
    newSocket.on("quiz-question", (data) => {
      console.log("Received quiz question:", data);
      setCurrentQuestion(data);
      setTimeRemaining(data.timeLimit);
      setSelectedOption(null);
      setAnswerSubmitted(false);
      setCorrectAnswer(null);
      setExplanation("");
    });

    // Listen for statistics updates
    newSocket.on("statistics-update", (data) => {
      console.log("Received statistics update:", data);
      setStatistics({
        totalParticipants: data.totalParticipants,
        answeredCount: data.answeredCount,
        percentCorrect: data.percentCorrect,
        percentIncorrect: data.percentIncorrect,
      });
    });

    // Listen for answer received confirmation
    newSocket.on("answer-received", (data) => {
      console.log("Answer received confirmation:", data);
      setAnswerSubmitted(true);
    });

    // Listen for question ended event
    newSocket.on("question-ended", (data) => {
      console.log("Question ended:", data);
      // No longer setting correctAnswer and explanation here
      // as they should only be revealed at the end of the quiz
    });

    // Listen for quiz completed event
    newSocket.on("quiz-completed", (data) => {
      console.log("Quiz completed:", data);
      setQuizCompleted(true);
      setResults(data.statistics);
    });

    // Error handling
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError(
        `Failed to connect to the quiz server: ${err.message}. Please try again.`
      );
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
      setError(`Socket error: ${err.message}. Please try again.`);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        newSocket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [quizId, user, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (!currentQuestion || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, timeRemaining]);

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (answerSubmitted || correctAnswer) return; // Prevent changing after submission or when answer is revealed
    setSelectedOption(optionId);
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!selectedOption || answerSubmitted || !socket || !currentQuestion)
      return;

    socket.emit("submit-answer", {
      quizId,
      questionIndex: currentQuestion.questionIndex,
      optionId: selectedOption,
    });
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle quiz exit
  const handleExitQuiz = () => {
    navigate("/quizzes");
  };

  // Render loading state
  if (!currentQuestion && !quizCompleted && !error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-primary">Loading quiz...</h2>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 theme-transition mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-primary">Error</h2>
        <p className="mt-2 text-error-light dark:text-error-dark theme-transition">
          {error}
        </p>
        <div className="mt-6">
          <button onClick={handleExitQuiz} className="modern-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Render quiz completed state with results
  if (quizCompleted) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="modern-card overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Quiz Completed!
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary">
              Here are your results
            </p>
          </div>

          <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
            <dl>
              <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
                <dt className="text-sm font-medium text-secondary">
                  Total Participants
                </dt>
                <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2">
                  {results.leaderboard.length}
                </dd>
              </div>

              {results?.currentQuestionIndex && (
                <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Total Questions
                  </dt>
                  <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2">
                    {(results?.currentQuestionIndex || 0) + 1}
                  </dd>
                </div>
              )}

              <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
                <dt className="text-sm font-medium text-secondary">
                  Your Correct Answers
                </dt>
                <dd className="mt-1 text-sm text-success-light dark:text-success-dark sm:mt-0 sm:col-span-2 theme-transition">
                  {results.leaderboard.find((e) => e.userId == user._id)
                    ?.correctAnswers || 0}
                </dd>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
                <dt className="text-sm font-medium text-secondary">
                  Your Incorrect Answers
                </dt>
                <dd className="mt-1 text-sm text-error-light dark:text-error-dark sm:mt-0 sm:col-span-2 theme-transition">
                  {results.leaderboard.find((e) => e.userId == user._id)
                    ?.incorrectAnswers || 0}
                </dd>
              </div>

              {results?.currentQuestionIndex && (
                <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Percentage Correct
                  </dt>

                  <dd className="mt-1 text-sm text-primary-600 dark:text-primary-400 sm:mt-0 sm:col-span-2 theme-transition">
                    {((results.leaderboard.find((e) => e.userId == user._id)
                      ?.correctAnswers || 0) *
                      100) /
                      ((results?.currentQuestionIndex || 0) + 1)}
                    %
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-8 modern-card overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Leaderboard
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary">
              Top performers in this quiz
            </p>
          </div>

          <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
            {results?.leaderboard && results.leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-100 dark:divide-primary-800 theme-transition">
                  <thead className="bg-primary-50 dark:bg-primary-900/20 theme-transition">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        Correct
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        Incorrect
                      </th>
                      {results.currentQuestionIndex && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                        >
                          Percentage
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-primary-100 dark:divide-primary-800 theme-transition">
                    {results.leaderboard.map((entry) => {
                      // Highlight the current user
                      const isCurrentUser = entry.userId === user._id;
                      return (
                        <tr
                          key={entry.userId}
                          className={`${
                            isCurrentUser
                              ? "bg-primary-100 dark:bg-primary-800/30"
                              : ""
                          } theme-transition`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                            {entry.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {entry.username} {isCurrentUser && "(You)"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {entry.score}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-success-light dark:text-success-dark theme-transition">
                            {entry.correctAnswers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-error-light dark:text-error-dark theme-transition">
                            {entry.incorrectAnswers}
                          </td>
                          {results.currentQuestionIndex && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400 theme-transition">
                              {(entry.correctAnswers * 100) /
                                (results.currentQuestionIndex + 1)}
                              %
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-5 sm:px-6 text-center text-secondary">
                No leaderboard data available
              </div>
            )}
          </div>
        </div>

        {/* Questions and Answers Section */}
        {results?.questionsWithAnswers &&
          results.questionsWithAnswers.length > 0 && (
            <div className="mt-8 modern-card overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-primary">
                  Questions and Answers
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-secondary">
                  Review all questions with correct answers and explanations
                </p>
              </div>

              <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
                <div className="divide-y divide-primary-100 dark:divide-primary-800">
                  {results.questionsWithAnswers.map((question, index) => (
                    <div key={index} className="p-6">
                      <h4 className="text-xl font-medium text-primary mb-4">
                        Question {index + 1}: {question.text}
                      </h4>

                      <div className="space-y-3 mb-4">
                        {question.options.map((option) => (
                          <div
                            key={option._id}
                            className={`p-3 border rounded-lg ${
                              option._id === question.correctOptionId
                                ? "border-success-light bg-success-light/10 dark:bg-success-dark/10 dark:border-success-dark"
                                : "border-primary-200 dark:border-primary-700"
                            } theme-transition`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div
                                  className={`h-5 w-5 rounded-full border ${
                                    option._id === question.correctOptionId
                                      ? "border-success-light bg-success-light dark:border-success-dark dark:bg-success-dark"
                                      : "border-primary-400 dark:border-primary-500"
                                  } theme-transition`}
                                ></div>
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  className={`font-medium ${
                                    option._id === question.correctOptionId
                                      ? "text-success-light dark:text-success-dark"
                                      : "text-primary"
                                  } theme-transition`}
                                >
                                  {option.text}
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 p-3 bg-info-50 dark:bg-info-900/20 rounded-lg theme-transition">
                          <h5 className="text-sm font-medium text-info-light dark:text-info-dark mb-1 theme-transition">
                            Explanation:
                          </h5>
                          <p className="text-sm text-info-light dark:text-info-dark theme-transition">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        <div className="mt-6 text-center">
          <button onClick={handleExitQuiz} className="modern-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Render active quiz state
  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Question and options */}
        <div className="lg:col-span-2">
          <div className="modern-card overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-primary">
                Question {currentQuestion.questionNumber} of{" "}
                {currentQuestion.totalQuestions}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-secondary">
                {currentQuestion.points} points
              </p>
            </div>

            <div className="border-t border-primary-100 dark:border-primary-800 px-4 py-5 sm:px-6 theme-transition">
              <h4 className="text-xl font-medium text-primary mb-6">
                {currentQuestion.text}
              </h4>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={option._id}
                    onClick={() => handleOptionSelect(option._id)}
                    className={`p-4 border rounded-lg cursor-pointer theme-transition ${
                      selectedOption === option._id
                        ? "border-primary-500 bg-primary-50/80 dark:bg-primary-900/20 dark:border-primary-400 ring-2 ring-primary-500 dark:ring-primary-400 ring-offset-1 dark:ring-offset-gray-800"
                        : "border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            selectedOption === option._id
                              ? "border-primary-500 bg-green-500 dark:border-primary-400 dark:bg-green-500"
                              : "border-primary-400 dark:border-primary-500"
                          } theme-transition`}
                        ></div>
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          className={`font-medium ${
                            selectedOption === option._id
                              ? "text-primary-700 dark:text-primary-300"
                              : "text-primary"
                          } theme-transition`}
                        >
                          {String.fromCharCode(65 + index)}. {option.text}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation section removed - will only be shown at the end of the quiz */}

              <div className="mt-6">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={
                    !selectedOption || answerSubmitted || correctAnswer !== null
                  }
                  className={`modern-button ${
                    !selectedOption || answerSubmitted || correctAnswer !== null
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {answerSubmitted ? "Answer Submitted" : "Submit Answer"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Timer and statistics */}
        <div>
          <div className="modern-card overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-primary">
                Quiz Progress
              </h3>
            </div>

            <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
              <dl>
                <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Time Remaining
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-primary">
                    {formatTime(timeRemaining)}
                  </dd>
                </div>

                <div className="bg-card px-4 py-5 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Total Participants
                  </dt>
                  <dd className="mt-1 text-sm text-primary">
                    {statistics.totalParticipants}
                  </dd>
                </div>

                {/* <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Answers Submitted
                  </dt>
                  <dd className="mt-1 text-sm text-primary">
                    {statistics.answeredCount} / {statistics.totalParticipants}
                  </dd>
                </div> */}

                <div className="bg-card px-4 py-5 sm:px-6 theme-transition">
                  <dt className="text-sm font-medium text-secondary">
                    Correct Answers
                  </dt>
                  <dd className="mt-1">
                    <div className="w-full bg-primary-200 dark:bg-primary-700 rounded-full h-2.5 theme-transition">
                      <div
                        className="bg-success-light dark:bg-success-dark h-2.5 rounded-full transition-all duration-500 theme-transition"
                        style={{ width: `${statistics.percentCorrect}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-primary">
                      {statistics.percentCorrect}%
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveQuiz;
