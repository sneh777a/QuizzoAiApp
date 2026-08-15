# Live Quiz App Backend

## Overview

This is the backend server for the Live Quiz Application, built with Node.js, Express, MongoDB, and Socket.io. It provides APIs for user authentication, quiz creation, and real-time quiz participation.

## Features

- **User Authentication**: Register, login, logout, and profile management
- **Quiz Management**: Create, edit, and manage quizzes
- **AI-Generated Questions**: Automatic generation of quiz questions using Google's Gemini API
- **Real-time Updates**: Socket.io integration for live quiz participation
- **Scheduled Quizzes**: Automatic quiz start using cron jobs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`
5. Start the development server:

```bash
npm run dev
```

## Environment Variables

Copy the `.env.example` file to a new file named `.env` and update the values:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/live-quiz-app

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

## API Documentation

API documentation is available in the following files:
- `apiList.md`: Basic API list
- `apiList with request body.md`: Detailed API documentation with request/response examples

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── docs/             # Documentation
├── middleware/       # Express middleware
├── models/           # Mongoose models
├── routes/           # Express routes
├── services/         # Business logic services
├── .env              # Environment variables (create this)
├── .env.example      # Example environment variables
├── package.json      # Project dependencies
└── server.js         # Entry point
```

## Code Quality and Best Practices

- **Error Handling**: Centralized error handling middleware
- **Authentication**: JWT-based authentication with middleware protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Request validation using Mongoose schemas
- **Secure Headers**: Implementation of security best practices

## Socket.io Events

Socket.io events are documented in `docs/socket-events.md`.

## AI Integration

The application uses Google's Gemini API to generate quiz questions. Setup instructions are available in `docs/ai-integration.md`.

## License

MIT