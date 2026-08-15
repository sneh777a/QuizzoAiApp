import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const Quizzes = () => {
  const { user } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [scheduledQuizzes, setScheduledQuizzes] = useState([]);
  const [loading, setLoading] = useState({
    completed: false,
    scheduled: false,
  });
  const [error, setError] = useState({
    completed: "",
    scheduled: "",
  });

  useEffect(() => {
    if (user) {
      fetchCompletedQuizzes();
      fetchScheduledQuizzes();
    }
  }, [user]);

  const fetchCompletedQuizzes = async () => {
    setLoading((prev) => ({ ...prev, completed: true }));
    setError((prev) => ({ ...prev, completed: "" }));

    try {
      const response = await quizAPI.getCompletedQuizzes();
      if (response.data.success) {
        setCompletedQuizzes(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch completed quizzes"
        );
      }
    } catch (err) {
      console.error("Error fetching completed quizzes:", err);
      setError((prev) => ({
        ...prev,
        completed: err.message || "Failed to load completed quizzes",
      }));
      setCompletedQuizzes([]);
    } finally {
      setLoading((prev) => ({ ...prev, completed: false }));
    }
  };

  const fetchScheduledQuizzes = async () => {
    setLoading((prev) => ({ ...prev, scheduled: true }));
    setError((prev) => ({ ...prev, scheduled: "" }));

    try {
      const response = await quizAPI.getScheduledQuizzes();
      if (response.data.success) {
        setScheduledQuizzes(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch scheduled quizzes"
        );
      }
    } catch (err) {
      console.error("Error fetching scheduled quizzes:", err);
      setError((prev) => ({
        ...prev,
        scheduled: err.message || "Failed to load scheduled quizzes",
      }));
      setScheduledQuizzes([]);
    } finally {
      setLoading((prev) => ({ ...prev, scheduled: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-app theme-transition">
      <h1 className="text-2xl font-semibold text-primary mb-6">Quizzes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="modern-card p-6">
          <h2 className="text-lg font-medium text-primary mb-4">
            Create a Quiz
          </h2>
          <p className="text-secondary mb-4">
            Create a new quiz with AI-generated questions based on your
            specifications.
          </p>
          <Link
            to="/quizzes/create"
            className="modern-button inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:!text-white dark:text-white dark:hover:!text-white theme-transition"
          >
            Create Quiz
          </Link>
        </div>

        <div className="modern-card p-6">
          <h2 className="text-lg font-medium text-primary mb-4">Join a Quiz</h2>
          <p className="text-secondary mb-4">
            Join an existing quiz using a quiz ID provided by the quiz creator.
          </p>
          <Link
            to="/quizzes/join"
            className="modern-button inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:!text-white dark:text-white dark:hover:!text-white theme-transition"
          >
            Join Quiz
          </Link>
        </div>
      </div>

      {/* Scheduled Quizzes Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium text-primary mb-4">
          My Scheduled Quizzes
        </h2>
        <div className="modern-card overflow-hidden sm:rounded-lg">
          {loading.scheduled ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
              <p className="mt-2 text-secondary">
                Loading scheduled quizzes...
              </p>
            </div>
          ) : error.scheduled ? (
            <div className="p-6 text-center text-error-light dark:text-error-dark">
              {error.scheduled}
            </div>
          ) : scheduledQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 theme-transition">
                <thead className="bg-primary-50 dark:bg-primary-900/20 theme-transition">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Quiz ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Topic Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Questions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Difficulty
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Time Limit
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Scheduled For
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700 theme-transition">
                  {scheduledQuizzes.map((quiz) => (
                    <tr
                      key={quiz.quizId}
                      className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 theme-transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {quiz.quizId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.topicName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.numberOfQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.totalTimeLimit}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {formatDate(quiz.scheduledFor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-secondary">
              You don't have any scheduled quizzes.
            </div>
          )}
        </div>
      </div>

      {/* Completed Quizzes Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium text-primary mb-4">
          My Completed Quizzes
        </h2>
        <div className="modern-card overflow-hidden sm:rounded-lg">
          {loading.completed ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
              <p className="mt-2 text-secondary">
                Loading completed quizzes...
              </p>
            </div>
          ) : error.completed ? (
            <div className="p-6 text-center text-error-light dark:text-error-dark">
              {error.completed}
            </div>
          ) : completedQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 theme-transition">
                <thead className="bg-primary-50 dark:bg-primary-900/20 theme-transition">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Quiz ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Topic Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Questions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Difficulty
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700 theme-transition">
                  {completedQuizzes.map((quiz) => (
                    <tr
                      key={quiz.quizId}
                      className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 theme-transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {quiz.quizId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.topicName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.numberOfQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {quiz.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                        {quiz.totalScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-success-light dark:text-success-dark">
                        {quiz.correctAnswers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-error-light dark:text-error-dark">
                        {quiz.incorrectAnswers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {formatDate(quiz.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-secondary">
              You don't have any completed quizzes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
