# My Scheduled Quizzes API

## Overview

This API endpoint allows users to retrieve a list of their scheduled quizzes that have not yet started. It returns essential information needed to display these quizzes in a table format.

## Endpoint

```
GET /api/quiz/my-scheduled-quizzes
```

## Authentication

This endpoint requires authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response

### Success Response

**Status Code**: 200 OK

**Response Body**:

```json
{
  "success": true,
  "data": [
    {
      "quizId": "60d21b4667d0d01ce8b3e369",
      "title": "JavaScript Fundamentals",
      "topicName": "Programming",
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "totalTimeLimit": 300,
      "scheduledFor": "2023-12-31T12:00:00.000Z"
    },
    {
      "quizId": "60d21b4667d0d01ce8b3e370",
      "title": "React Basics",
      "topicName": "Web Development",
      "numberOfQuestions": 5,
      "difficulty": "easy",
      "totalTimeLimit": 150,
      "scheduledFor": "2024-01-15T15:30:00.000Z"
    }
  ]
}
```

### Error Response

**Status Code**: 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**Status Code**: 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error"
}
```

## Response Fields

| Field             | Type      | Description                                           |
|-------------------|-----------|-------------------------------------------------------|
| quizId            | String    | Unique identifier for the quiz                        |
| title             | String    | Title of the quiz                                     |
| topicName         | String    | Main topic or subject of the quiz                     |
| numberOfQuestions | Number    | Total number of questions in the quiz                 |
| difficulty        | String    | Difficulty level (easy, medium, hard)                 |
| totalTimeLimit    | Number    | Total time limit for the quiz in seconds              |
| scheduledFor      | ISO Date  | Scheduled start time of the quiz in ISO date format   |

## Usage Example

### JavaScript (Axios)

```javascript
const axios = require('axios');

async function getMyScheduledQuizzes() {
  try {
    const token = localStorage.getItem('token'); // Get token from storage
    
    const response = await axios.get('http://localhost:5000/api/quiz/my-scheduled-quizzes', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Process the scheduled quizzes
      const scheduledQuizzes = response.data.data;
      console.log('My scheduled quizzes:', scheduledQuizzes);
      return scheduledQuizzes;
    }
  } catch (error) {
    console.error('Error fetching scheduled quizzes:', error);
  }
}
```

## Notes

- This endpoint only returns quizzes with a status of "scheduled".
- Only quizzes created by the authenticated user are returned.
- The response is sorted by the scheduled start time in ascending order.
- The `totalTimeLimit` is provided in seconds and may need to be formatted for display (e.g., converting to minutes and seconds).