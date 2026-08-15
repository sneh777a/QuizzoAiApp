# My Completed Quizzes API

## Overview
This API endpoint allows users to retrieve all quizzes they have participated in that have been completed. It returns detailed information about each quiz including topic name, number of questions, difficulty, time limits, and the user's performance metrics.

## Endpoint Details

- **URL**: `/api/quiz/my-completed-quizzes`
- **Method**: `GET`
- **Authentication**: Required (JWT Token)

## Request Headers

```
Authorization: Bearer <jwt_token>
```

## Success Response

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "data": [
    {
      "quizId": "60d21b4667d0d8992e610c85",
      "topicName": "JavaScript Fundamentals",
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "totalTimeLimit": 600,
      "scheduledFor": "2023-06-15T14:00:00.000Z",
      "totalScore": 85,
      "correctAnswers": 8,
      "incorrectAnswers": 2,
      "completedAt": "2023-06-15T14:45:30.000Z"
    },
    {
      "quizId": "60d21b4667d0d8992e610c86",
      "topicName": "React Hooks",
      "numberOfQuestions": 15,
      "difficulty": "hard",
      "totalTimeLimit": 900,
      "scheduledFor": "2023-06-10T10:00:00.000Z",
      "totalScore": 70,
      "correctAnswers": 7,
      "incorrectAnswers": 8,
      "completedAt": "2023-06-10T10:55:20.000Z"
    }
  ]
}
```

## Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:

```json
{
  "success": false,
  "message": "Server error"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| quizId | String | Unique identifier for the quiz |
| topicName | String | The topic or subject of the quiz |
| numberOfQuestions | Number | Total number of questions in the quiz |
| difficulty | String | Difficulty level of the quiz (easy, medium, hard) |
| totalTimeLimit | Number | Total time limit for the quiz in seconds |
| scheduledFor | Date | The date and time when the quiz was scheduled |
| totalScore | Number | The user's total score in the quiz |
| correctAnswers | Number | Number of questions answered correctly |
| incorrectAnswers | Number | Number of questions answered incorrectly |
| completedAt | Date | The date and time when the user completed the quiz |

## Example Usage

```javascript
// Using Axios
const axios = require('axios');

const getMyCompletedQuizzes = async (token) => {
  try {
    const response = await axios.get('http://your-api-url/api/quiz/my-completed-quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('My Completed Quizzes:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching completed quizzes:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```