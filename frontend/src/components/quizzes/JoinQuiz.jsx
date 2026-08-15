import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../utils/api';

const JoinQuiz = () => {
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!quizId.trim()) {
        throw new Error('Quiz ID is required');
      }

      const response = await quizAPI.joinQuiz(quizId.trim());

      if (response.data.success) {
        // Navigate to waiting room with quiz data
        navigate(`/quizzes/waiting-room/${quizId}`, { 
          state: { quizData: response.data.data } 
        });
      } else {
        throw new Error(response.data.message || 'Failed to join quiz');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-6">
        Join a Quiz
      </h1>

      <div className="modern-card sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-primary">
            Enter Quiz ID
          </h3>
          <div className="mt-2 max-w-xl text-sm text-secondary">
            <p>Enter the Quiz ID provided by the quiz creator to join a quiz.</p>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-error-50 dark:bg-error-900/30 p-4 theme-transition">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-error-light dark:text-error-dark theme-transition"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-light dark:text-error-dark theme-transition">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="quizId" className="sr-only">
                Quiz ID
              </label>
              <input
                type="text"
                name="quizId"
                id="quizId"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                className="modern-input block w-full sm:text-sm"
                placeholder="Enter Quiz ID"
                required
              />
            </div>
            <div className="mt-5 flex">
              <button
                type="submit"
                disabled={loading}
                className="modern-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Join Quiz'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/quizzes')}
                className="ml-3 modern-button-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;