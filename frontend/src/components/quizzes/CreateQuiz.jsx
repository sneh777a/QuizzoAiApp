import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../../utils/api";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    topicDescription: "",
    category: "Topic", // Default to Topic
    topicName: "",
    numberOfQuestions: 5,
    difficulty: "medium",
    timePerQuestion: 30,
    scheduledFor: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate form
      if (!formData.title) {
        throw new Error("Title is required");
      }
      if (!formData.category) {
        throw new Error("Category is required");
      }
      if (!formData.numberOfQuestions || formData.numberOfQuestions < 1) {
        throw new Error("Number of questions must be at least 1");
      }
      if (!formData.timePerQuestion || formData.timePerQuestion < 10) {
        throw new Error("Time per question must be at least 10 seconds");
      }
      if (!formData.scheduledFor) {
        throw new Error("Scheduled date and time is required");
      }

      // Ensure scheduled time is in the future
      const scheduledTime = new Date(formData.scheduledFor);
      const now = new Date();
      if (scheduledTime <= now) {
        throw new Error("Scheduled time must be in the future");
      }

      // Submit form
      const response = await quizAPI.createQuiz({
        ...formData,
        numberOfQuestions: parseInt(formData.numberOfQuestions),
        timePerQuestion: parseInt(formData.timePerQuestion),
      });

      if (response.data.success) {
        setSuccess(true);
        setQuizId(response.data.data.quizId);
      } else {
        throw new Error(response.data.message || "Failed to create quiz");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuizId = () => {
    navigator.clipboard.writeText(quizId);
  };

  // Calculate minimum date-time for the scheduler (current time + 10 minutes)
  const getMinScheduleTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // Add 10 minutes buffer
    return now.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-6">
        Create a Quiz
      </h1>

      {success && quizId ? (
        <div className="modern-card sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Quiz Created Successfully!
            </h3>
            <div className="mt-2 max-w-xl text-sm text-secondary">
              <p>
                Your quiz has been created and scheduled. Share the Quiz ID with
                participants so they can join.
              </p>
            </div>
            <div className="mt-5">
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={quizId}
                  className="modern-input flex-1 min-w-0 block w-full"
                />
                <button
                  type="button"
                  onClick={handleCopyQuizId}
                  className="modern-button ml-3 inline-flex items-center"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/quizzes")}
                  className="modern-button inline-flex items-center"
                >
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 modern-card px-4 py-5 sm:rounded-lg sm:p-6"
        >
          {error && (
            <div className="rounded-md bg-error-50 dark:bg-error-900/30 p-4 theme-transition">
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

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-secondary"
              >
                Quiz Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  placeholder="Enter a title for your quiz"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-secondary"
              >
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  required
                >
                  <option value="Topic">Based on Topic</option>
                  <option value="Book">Based on Book</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="topicName"
                className="block text-sm font-medium text-secondary"
              >
                {formData.category === "Book" ? "Book Title" : "Topic Name"}{" "}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="topicName"
                  id="topicName"
                  value={formData.topicName}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  placeholder={
                    formData.category === "Book"
                      ? "Enter book title"
                      : "Enter topic name"
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="topicDescription"
                className="block text-sm font-medium text-secondary"
              >
                Description (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="topicDescription"
                  name="topicDescription"
                  rows="3"
                  value={formData.topicDescription}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  placeholder="Describe the topic"
                ></textarea>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="numberOfQuestions"
                className="block text-sm font-medium text-secondary"
              >
                Number of Questions
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="numberOfQuestions"
                  id="numberOfQuestions"
                  min="1"
                  max="20"
                  value={formData.numberOfQuestions}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-secondary"
              >
                Difficulty
              </label>
              <div className="mt-1">
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="timePerQuestion"
                className="block text-sm font-medium text-secondary"
              >
                Time Per Question (seconds)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="timePerQuestion"
                  id="timePerQuestion"
                  min="10"
                  max="300"
                  value={formData.timePerQuestion}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="scheduledFor"
                className="block text-sm font-medium text-secondary"
              >
                Scheduled Date & Time
              </label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  id="scheduledFor"
                  min={getMinScheduleTime()}
                  value={formData.scheduledFor}
                  onChange={handleChange}
                  className="modern-input block w-full sm:text-sm"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-secondary">
                Schedule at least 10 minutes in the future to allow participants
                to join.
              </p>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/quizzes")}
                className="modern-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="modern-button ml-3 inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Quiz"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateQuiz;
