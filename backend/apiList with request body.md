```
# Authentication API List with Request Body Examples

## Base URL

```

http://localhost:5000/api

````

## Authentication APIs

### 1. Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
````

- **Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "profilePicture": "default-avatar.png",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

- **Error Responses**:
  - `400 Bad Request`: Username or email already exists
  - `400 Bad Request`: Validation error (e.g., password too short)

### 2. Login User

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Login with existing user credentials
- **Request Body**:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "profilePicture": "default-avatar.png",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials

### 3. Get Current User

- **URL**: `/auth/me`
- **Method**: `GET`
- **Description**: Get current user profile
- **Headers**:

```
Authorization: Bearer jwt_token
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "profilePicture": "default-avatar.png",
    "notificationPreferences": {
      "email": {
        "quizReminders": true,
        "quizResults": true,
        "newFeatures": false
      },
      "inApp": {
        "quizReminders": true,
        "quizResults": true,
        "participantJoined": true
      }
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

- **Error Responses**:
  - `401 Unauthorized`: No token or invalid token
  - `404 Not Found`: User not found

### 4. Logout User

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: Logout user (client-side token removal)
- **Headers**:

```
Authorization: Bearer jwt_token
```

- **Response**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

- **Error Responses**:
  - `401 Unauthorized`: No token or invalid token

## Quiz APIs

### 1. Create Quiz

- **URL**: `/quiz/create`
- **Method**: `POST`
- **Description**: Create a new quiz with specified options
- **Headers**:

```
Authorization: Bearer jwt_token
```

- **Request Body**:

```json
{
  "title": "JavaScript Fundamentals",
  "topicDescription": "Test your knowledge of JavaScript basics",
  "category": "Topic",
  "topicName": "Programming",
  "numberOfQuestions": 10,
  "difficulty": "medium",
  "timePerQuestion": 30,
  "scheduledFor": "2023-12-31T12:00:00Z"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "quizId": "quiz_id_here",
    "title": "JavaScript Fundamentals",
    "scheduledFor": "2023-12-31T12:00:00Z"
  }
}
```

- **Error Responses**:
  - `400 Bad Request`: Missing required fields
  - `401 Unauthorized`: No token or invalid token
  - `429 Too Many Requests`: Rate limit exceeded (max 5 quizzes per hour)

### 2. Get Completed Quizzes

- **URL**: `/quiz/completed`
- **Method**: `GET`
- **Description**: Get all completed quizzes for the current user
- **Headers**:

```
Authorization: Bearer jwt_token
```

- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "quizId": "quiz_id_here",
      "topicName": "Programming",
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "totalTimeLimit": 300,
      "scheduledFor": "2023-12-31T12:00:00Z",
      "totalScore": 85,
      "correctAnswers": 8,
      "incorrectAnswers": 2,
      "completedAt": "2023-12-31T12:30:00Z"
    }
  ]
}
```

- **Error Responses**:
  - `401 Unauthorized`: No token or invalid token

### 3. Get Scheduled Quizzes

- **URL**: `/quiz/scheduled`
- **Method**: `GET`
- **Description**: Get all scheduled quizzes for the current user
- **Headers**:

```
Authorization: Bearer jwt_token
```

- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "quizId": "quiz_id_here",
      "topicName": "Programming",
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "totalTimeLimit": 300,
      "scheduledFor": "2023-12-31T12:00:00Z"
    }
  ]
}
```

- **Error Responses**:
  - `401 Unauthorized`: No token or invalid token

## Setting Up in Postman

### Collection Setup

1. Create a new collection named "Live Quiz App"
2. Set up environment variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: (will be automatically set after login)

### Automatic Token Handling

For authenticated requests, add this to the "Tests" tab to automatically save the token:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
  }
}
```

### Request Setup

#### 1. Register User

- Method: POST
- URL: {{baseUrl}}/auth/register
- Body (raw JSON):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 2. Login User

- Method: POST
- URL: {{baseUrl}}/auth/login
- Body (raw JSON):

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 3. Get Current User

- Method: GET
- URL: {{baseUrl}}/auth/me
- Authorization:
  - Type: Bearer Token
  - Token: {{token}}

#### 4. Logout User

- Method: POST
- URL: {{baseUrl}}/auth/logout
- Authorization:
  - Type: Bearer Token
  - Token: {{token}}

#### 5. Create Quiz

- Method: POST
- URL: {{baseUrl}}/quiz/create
- Authorization:
  - Type: Bearer Token
  - Token: {{token}}
- Body (raw JSON):

```json
{
  "title": "JavaScript Fundamentals",
  "topicDescription": "Test your knowledge of JavaScript basics",
  "category": "Topic",
  "topicName": "Programming",
  "numberOfQuestions": 10,
  "difficulty": "medium",
  "timePerQuestion": 30,
  "scheduledFor": "2023-12-31T12:00:00Z"
}
```

#### 6. Get Completed Quizzes

- Method: GET
- URL: {{baseUrl}}/quiz/completed
- Authorization:
  - Type: Bearer Token
  - Token: {{token}}

#### 7. Get Scheduled Quizzes

- Method: GET
- URL: {{baseUrl}}/quiz/scheduled
- Authorization:
  - Type: Bearer Token
  - Token: {{token}}
