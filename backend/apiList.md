# Authentication API List for Postman Testing

## Base URL
```
http://localhost:5000/api
```

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

## Quiz APIs

1. `POST /api/quiz/create` - Create a new quiz
2. `POST /api/quiz/join` - Join a quiz waiting room
3. `POST /api/quiz/start/:id` - Start a quiz manually (admin or creator only)
4. `POST /api/quiz/submit-answer` - Submit an answer to a quiz question
5. `GET /api/quiz/user-stats` - Get quiz statistics for the current user
6. `GET /api/quiz/my-scheduled-quizzes` - Get all scheduled quizzes created by the current user
7. `GET /api/quiz/my-completed-quizzes` - Get all completed quizzes that the user has participated in
8. `GET /api/quiz/:id/current-question` - Get the current question for a quiz

## Setting Up in Postman

1. Create a new collection named "Live Quiz App"
2. Set up environment variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: (will be automatically set after login)

3. For authenticated requests, add this to the "Tests" tab to automatically save the token:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
    }
}
```

4. For authenticated requests, add this to the Authorization tab:
   - Type: Bearer Token
   - Token: {{token}}