import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Quizzes from "./components/quizzes/Quizzes";
import CreateQuiz from "./components/quizzes/CreateQuiz";
import JoinQuiz from "./components/quizzes/JoinQuiz";
import WaitingRoom from "./components/quizzes/WaitingRoom";
import ActiveQuiz from "./components/quizzes/ActiveQuiz";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

// Dark mode toggle component
const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-app theme-transition w-screen overflow-x-hidden">
            <DarkModeToggle />

            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/quizzes/create" element={<CreateQuiz />} />
                  <Route path="/quizzes/join" element={<JoinQuiz />} />
                  <Route
                    path="/quizzes/waiting-room/:quizId"
                    element={<WaitingRoom />}
                  />
                  <Route
                    path="/quizzes/active/:quizId"
                    element={<ActiveQuiz />}
                  />
                  {/* Add more protected routes here */}
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
