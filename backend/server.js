const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
// const summaryRoutes = require('./routes/summary.routes');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Add middleware for socket authentication
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    console.log("Socket authentication: Token received");
    // We're just validating that a token exists for now
    // You can add JWT verification here if needed
    return next();
  }
  console.log("Socket authentication: No token provided");
  return next(new Error("Authentication error: No token provided"));
});

// Initialize socket service
const socketService = require("./services/socket.service");
socketService.initialize(io);

// Initialize AI service
const aiService = require("./services/ai.service");
const aiConfig = require("./config/ai.config");
try {
  aiService.initialize(aiConfig.geminiApiKey);
} catch (error) {
  console.warn("AI service initialization failed:", error.message);
  console.warn(
    "Quiz questions will not be generated automatically. Please set GEMINI_API_KEY in your environment variables."
  );
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Quiz App API!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
// app.use('/api/summary', summaryRoutes);

// Socket.io connection handling is now managed in socket.service.js

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Initialize scheduler service after DB connection is established
    const schedulerService = require("./services/scheduler.service");
    schedulerService.initialize();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling middleware (should be after all routes)
const { errorHandler, notFound } = require("./middleware/error.middleware");
app.use(notFound);
app.use(errorHandler);

module.exports = { app, server }; // Export for testing purposes
