import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { quizAPI } from "../../utils/api";
import ReactApexChart from "react-apexcharts";

const RECENT_LIMIT = 5;
const Dashboard = () => {
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalParticipated: 0,
    totalCreated: 0,
    averageScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [quizFilter, setQuizFilter] = useState(5); // Default filter value

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoadingStats(true);
    setStatsError("");

    try {
      const response = await quizAPI.getUserStats();

      if (response.data.success) {
        const { stats, recentActivity } = response.data.data;
        setStats(stats);
        setRecentActivity(recentActivity || []);
      } else {
        throw new Error("Failed to fetch user statistics");
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setStatsError("Failed to load statistics. Please try again later.");
      // Set default values in case of error
      setStats({
        totalParticipated: 0,
        totalCreated: 0,
        averageScore: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
      });
      setRecentActivity([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app theme-transition">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-secondary theme-transition">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app theme-transition">
      <nav className="bg-primary-600 dark:bg-primary-800 shadow-md theme-transition">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-white text-xl font-bold">Quiz App</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={handleLogout}
                  className="modern-button-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-primary">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="modern-card p-6 text-center">
                {error ? (
                  <p className="text-error-light dark:text-error-dark theme-transition">
                    {error}
                  </p>
                ) : user ? (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-2">
                      Welcome, {user.username}!
                    </h2>
                    <p className="mt-2 text-secondary">{user.email}</p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quiz Statistics Card */}
                      <div className="modern-card p-6">
                        <h3 className="text-lg font-medium text-primary mb-4">
                          Quiz Statistics
                        </h3>
                        {loadingStats ? (
                          <div className="mt-4 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
                          </div>
                        ) : statsError ? (
                          <div className="mt-4 text-center text-error-light dark:text-error-dark">
                            {statsError}
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2">
                              <div className="mt-4 grid grid-cols-1 gap-4">
                                <div className="bg-primary-50/50 dark:bg-primary-900/20 p-4 rounded-lg text-center shadow-sm">
                                  <p className="text-sm text-secondary mb-1">
                                    Quizzes Taken
                                  </p>
                                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {stats.quizzesTaken}
                                  </p>
                                </div>
                                {/* <div className="bg-primary-50/50 dark:bg-primary-900/20 p-4 rounded-lg text-center shadow-sm">
                                <p className="text-sm text-secondary mb-1">
                                  Quizzes Created
                                </p>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                  {stats.totalCreated}
                                </p>
                              </div> */}
                              </div>
                              <div className="mt-4 grid grid-cols-1 gap-4">
                                <div className="bg-primary-50/50 dark:bg-primary-900/20 p-4 rounded-lg text-center shadow-sm">
                                  <p className="text-sm text-secondary mb-1">
                                    Average Score
                                  </p>
                                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {stats.averageScore}%
                                  </p>
                                </div>
                                {/* <div className="bg-primary-50/50 dark:bg-primary-900/20 p-4 rounded-lg text-center shadow-sm">
                                <p className="text-sm text-secondary mb-1">
                                  Correct Answers
                                </p>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                  {stats.correctAnswers}/
                                  {stats.totalQuestionsAnswered}
                                </p>
                              </div> */}
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-md font-medium text-primary">
                                  Quiz Performance
                                </h4>
                                <div className="flex space-x-2">
                                  <select
                                    value={quizFilter}
                                    onChange={(e) =>
                                      setQuizFilter(
                                        e.target.value === "all"
                                          ? "all"
                                          : Number(e.target.value)
                                      )
                                    }
                                    className="modern-input text-sm"
                                  >
                                    <option value="5">Last 5 Quizzes</option>
                                    <option value="20">Last 20 Quizzes</option>
                                    <option value="50">Last 50 Quizzes</option>
                                    <option value="all">All Quizzes</option>
                                  </select>
                                </div>
                              </div>

                              {recentActivity.length > 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                  <QuizPerformanceChart
                                    recentActivity={recentActivity}
                                    quizFilter={quizFilter}
                                  />
                                </div>
                              ) : (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center text-gray-500 dark:text-gray-400">
                                  <p>No quiz data available for chart</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        <button
                          className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200"
                          onClick={() => navigate("/quizzes")}
                        >
                          Browse Quizzes
                        </button>
                      </div>

                      {/* Recent Activity Card */}
                      <div className="modern-card p-6">
                        <h3 className="text-lg font-medium text-primary mb-4">
                          Recent Activity
                        </h3>
                        {loadingStats ? (
                          <div className="mt-4 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
                          </div>
                        ) : statsError ? (
                          <div className="mt-4 text-center text-error-light dark:text-error-dark">
                            {statsError}
                          </div>
                        ) : recentActivity.length > 0 ? (
                          <div className="mt-4 space-y-4">
                            {recentActivity
                              .slice(0, RECENT_LIMIT)
                              .map((activity, index) => (
                                <div
                                  key={index}
                                  className="border-b border-app pb-3 last:border-b-0 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 p-2 rounded-md transition-all duration-200"
                                >
                                  <p className="font-medium text-primary">
                                    {activity.quizTitle}
                                  </p>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-sm text-secondary">
                                      Score:{" "}
                                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                                        {activity.score}%
                                      </span>
                                    </p>
                                    <p className="text-xs text-secondary bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                                      {new Date(
                                        activity.completedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="mt-4 text-center text-secondary py-8">
                            <p>No recent quiz activity</p>
                            <p className="text-sm mt-2">
                              Join a quiz to see your results here
                            </p>
                          </div>
                        )}
                        <div className="flex space-x-4 mt-4">
                          <button
                            className="modern-button flex-1 inline-flex justify-center items-center"
                            onClick={() => navigate("/quizzes")}
                          >
                            Join Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    No user data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Quiz Performance Chart Component
const QuizPerformanceChart = ({ recentActivity, quizFilter }) => {
  const [chartKey, setChartKey] = useState(0);

  // Update chart when filter changes or dark mode changes
  useEffect(() => {
    // Force chart re-render when filter changes
    setChartKey((prevKey) => prevKey + 1);

    // Add event listener for theme changes
    const handleThemeChange = () => setChartKey((prevKey) => prevKey + 1);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleThemeChange);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleThemeChange);
    };
  }, [quizFilter]);
  // Filter quizzes based on the selected filter
  const filteredQuizzes =
    quizFilter === "all"
      ? [...recentActivity].reverse()
      : [...recentActivity].slice(-quizFilter).reverse();

  // Calculate the y-axis values (correct answers / total questions)
  const seriesData = filteredQuizzes.map((quiz) => {
    const correctAnswers = quiz.correctAnswers || 0;
    const totalQuestions =
      (quiz.correctAnswers || 0) + (quiz.incorrectAnswers || 0);
    return totalQuestions > 0
      ? parseFloat((correctAnswers / totalQuestions).toFixed(2))
      : 0;
  });

  // Get topic names for x-axis labels
  console.log("Recent Activity:", recentActivity);
  console.log("filteredQuizzes: ", filteredQuizzes);
  const categories = filteredQuizzes.map((quiz) => quiz.topicName || "Unknown");

  // Check if dark mode is active by looking at the document body class
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Chart options
  const chartOptions = {
    chart: {
      type: "area",
      height: 250,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: ["#6366F1"], // Indigo color to match the app theme
    xaxis: {
      categories: categories,
      labels: {
        show: true,
        style: {
          colors: isDarkMode ? "#94A3B8" : "#64748B",
          fontSize: "10px",
          fontFamily: "Inter, sans-serif",
        },
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: 120,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: 1,
      tickAmount: 5,
      labels: {
        style: {
          colors: isDarkMode ? "#94A3B8" : "#64748B",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
        formatter: function (val) {
          return (val * 100).toFixed(0) + "%";
        },
      },
    },
    tooltip: {
      theme: isDarkMode ? "dark" : "light",
      y: {
        formatter: function (val) {
          return (val * 100).toFixed(0) + "%";
        },
      },
    },
    grid: {
      borderColor: isDarkMode ? "#334155" : "#E2E8F0",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
  };

  const series = [
    {
      name: "Performance",
      data: seriesData,
    },
  ];

  return (
    <div className="quiz-performance-chart">
      {filteredQuizzes.length > 0 ? (
        <ReactApexChart
          key={chartKey}
          options={chartOptions}
          series={series}
          type="area"
          height={250}
        />
      ) : (
        <div className="flex justify-center items-center h-[250px] text-gray-500 dark:text-gray-400">
          <p>No quiz data available</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
