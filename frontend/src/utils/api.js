import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// Quiz API calls
export const quizAPI = {
  createQuiz: (quizData) => api.post("/quiz/create", quizData),
  // joinQuiz: (quizId) => api.post(`/quiz/${quizId}/join`),
  joinQuiz: (quizId) => api.post("/quiz/join", { quizId }),
  // startQuiz: (quizId) => api.post(`/quiz/${quizId}/start`),
  startQuiz: (quizId) => api.post(`/quiz/start/${quizId}`),
  // submitAnswer: (quizId, answerData) =>
  //   api.post(`/quiz/${quizId}/answer`, answerData),

  submitAnswer: (answerData) => api.post("/quiz/submit-answer", answerData),
  getCurrentQuestion: (quizId) => api.get(`/quiz/${quizId}/current-question`),
  getUserStats: () => api.get("/quiz/user-stats"),
  getCompletedQuizzes: () => api.get("/quiz/completed"),
  getScheduledQuizzes: () => api.get("/quiz/scheduled"),
};

export default api;
