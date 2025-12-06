# Socket.io Events Documentation

## Overview
This document outlines the Socket.io events used for real-time communication in the Live Quiz application. Frontend developers should use these events to implement real-time features.

The live quiz functionality uses Socket.io for real-time updates, including question progression, answer submission, and statistics updates.

## Connection

To connect to the Socket.io server from the frontend:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    Authorization: `Bearer ${token}` // If you implement socket authentication
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to socket server');
});

// Listen for disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});
```

## Quiz Creation Events

### Server to Client

#### `quiz-created`
Emitted when a new quiz is created.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  title: "Quiz Title",
  creator: "creator_user_id",
  scheduledFor: "2023-12-31T12:00:00Z" // ISO date string
}
```

**Example usage:**
```javascript
socket.on('quiz-created', (data) => {
  console.log(`New quiz created: ${data.title}`);
  // Update UI or notify user
});
```

## Quiz Room Events

### Client to Server

#### `join-quiz-room`
Sent when a user wants to join a quiz waiting room.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  userId: "user_id",
  username: "username"
}
```

**Example usage:**
```javascript
socket.emit('join-quiz-room', {
  quizId: "quiz_id",
  userId: "user_id",
  username: "username"
});
```

#### `leave-quiz-room`
Sent when a user leaves a quiz waiting room.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  userId: "user_id",
  username: "username"
}
```

**Example usage:**
```javascript
socket.emit('leave-quiz-room', {
  quizId: "quiz_id",
  userId: "user_id",
  username: "username"
});
```

### Server to Client

#### `joined-quiz-room`
Emitted to confirm that a user has successfully joined a quiz room.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  success: true
}
```

**Example usage:**
```javascript
socket.on('joined-quiz-room', (data) => {
  if (data.success) {
    console.log(`Successfully joined quiz room: ${data.quizId}`);
    // Update UI to show waiting room
  }
});
```

#### `user-joined`
Emitted to all users in a quiz room when a new user joins.

**Payload:**
```javascript
{
  userId: "user_id",
  username: "username",
  timestamp: "2023-12-31T12:00:00Z" // ISO date string
}
```

**Example usage:**
```javascript
socket.on('user-joined', (data) => {
  console.log(`${data.username} joined the quiz room`);
  // Update participant list in UI
});
```

#### `quiz-started`

Emitted to all users in a quiz room when a quiz starts (either automatically at scheduled time or manually by admin/creator).

**Payload:**
```javascript
{
  quizId: "quiz_id",
  title: "Quiz Title",
  startTime: "2023-12-31T12:00:00Z", // ISO date string
  totalTimeLimit: 300 // in seconds
}
```

**Example usage:**
```javascript
socket.on('quiz-started', (data) => {
  console.log(`Quiz ${data.title} has started!`);
  // Update UI to show active quiz state
  // Start countdown timer using totalTimeLimit
});
```

#### `quiz-completed`

Emitted to all users in a quiz room when a quiz completes (either automatically after time limit or manually by admin).

**Payload:**
```javascript
{
  quizId: "quiz_id",
  completionTime: "2023-12-31T12:05:00Z" // ISO date string
}
```

**Example usage:**
```javascript
socket.on('quiz-completed', (data) => {
  console.log(`Quiz completed at ${data.completionTime}`);
  // Update UI to show completed quiz state
  // Show final results or redirect to results page
});
```

#### `user-left`
Emitted to all users in a quiz room when a user leaves.

**Payload:**
```javascript
{
  userId: "user_id",
  username: "username",
  timestamp: "2023-12-31T12:00:00Z" // ISO date string
}
```

**Example usage:**
```javascript
socket.on('user-left', (data) => {
  console.log(`${data.username} left the quiz room`);
  // Update participant list in UI
});
```

#### `error`
Emitted when an error occurs during socket operations.

**Payload:**
```javascript
{
  message: "Error message"
}
```

**Example usage:**
```javascript
socket.on('error', (data) => {
  console.error(`Socket error: ${data.message}`);
  // Show error message to user
});
```

## Live Quiz Events

### Client to Server

#### `submit-answer`
Sent when a user submits an answer to a quiz question.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  questionIndex: 0, // Zero-based index of the question
  optionId: "option_id" // ID of the selected option
}
```

**Example usage:**
```javascript
socket.emit('submit-answer', {
  quizId: "quiz_id",
  questionIndex: 0,
  optionId: "option_id"
});
```

### Server to Client

#### `quiz-question`
Emitted when a new question is sent to all participants.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  questionIndex: 0, // Zero-based index of the question
  questionNumber: 1, // One-based number for display (questionIndex + 1)
  totalQuestions: 10,
  text: "What is the capital of France?",
  options: [
    { _id: "option_id_1", text: "Paris" },
    { _id: "option_id_2", text: "London" },
    { _id: "option_id_3", text: "Berlin" },
    { _id: "option_id_4", text: "Madrid" }
  ],
  timeLimit: 30, // in seconds
  points: 1
}
```

**Example usage:**
```javascript
socket.on('quiz-question', (data) => {
  console.log(`Question ${data.questionNumber}: ${data.text}`);
  // Display question and options to user
  // Start countdown timer using timeLimit
});
```

#### `answer-received`
Emitted to confirm that a user's answer has been received.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  questionIndex: 0,
  received: true
}
```

**Example usage:**
```javascript
socket.on('answer-received', (data) => {
  console.log(`Answer for question ${data.questionIndex + 1} received`);
  // Update UI to show answer has been submitted
});
```

#### `statistics-update`
Emitted when the statistics for a question are updated (e.g., when a user submits an answer).

**Payload:**
```javascript
{
  quizId: "quiz_id",
  questionIndex: 0,
  totalParticipants: 10,
  answeredCount: 5,
  percentCorrect: 60,
  percentIncorrect: 40
}
```

**Example usage:**
```javascript
socket.on('statistics-update', (data) => {
  console.log(`Question ${data.questionIndex + 1} statistics:`);
  console.log(`- ${data.answeredCount} out of ${data.totalParticipants} participants have answered`);
  console.log(`- ${data.percentCorrect}% answered correctly`);
  // Update UI with statistics
});
```

#### `question-ended`
Emitted when the time limit for a question has expired.

**Payload:**
```javascript
{
  quizId: "quiz_id",
  questionIndex: 0,
  correctOptionId: "option_id_1",
  explanation: "Paris is the capital of France",
  statistics: {
    answeredCount: 10,
    correctCount: 8,
    incorrectCount: 2,
    percentCorrect: 80,
    percentIncorrect: 20
  }
}
```

**Example usage:**
```javascript
socket.on('question-ended', (data) => {
  console.log(`Question ${data.questionIndex + 1} ended`);
  console.log(`Correct answer: ${data.correctOptionId}`);
  // Highlight correct answer
  // Show explanation
  // Display final statistics for this question
});
```

## Implementation Notes

1. The quiz creation process itself doesn't require socket functionality, but the socket events are used to notify users about newly created quizzes.

2. For the waiting room and active quiz phases, socket events are essential for real-time updates.

3. The frontend should handle reconnection logic in case the socket connection is lost.

4. All timestamps are in ISO format and should be parsed accordingly.

5. The live quiz functionality uses a combination of socket events and REST API endpoints. The socket events provide real-time updates, while the REST API endpoints provide a fallback for clients that might have socket connection issues.