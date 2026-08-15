# AI Integration for Quiz Question Generation

## Overview

This application uses Google's Gemini API to automatically generate quiz questions when a new quiz is created. The AI generates questions based on the quiz parameters provided by the user, such as category, sub-category, difficulty level, and number of questions.

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure the Application

1. In the backend directory, create a `.env` file if it doesn't exist already
2. Add your Gemini API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Restart the server for the changes to take effect

## How It Works

1. When a user creates a new quiz, the application sends the quiz parameters to the AI service
2. The AI service constructs a prompt based on these parameters
3. The prompt is sent to the Gemini API, which generates quiz questions
4. The generated questions are parsed and added to the quiz
5. The quiz is saved to the database with the generated questions

## Customization

You can customize the AI behavior by modifying the following files:

- `services/ai.service.js`: Contains the logic for generating and parsing quiz questions
- `config/ai.config.js`: Contains configuration options for the Gemini API

## Fallback Behavior

If the AI service fails to generate questions (e.g., due to API key issues, network problems, or API limitations), the quiz will be created with an empty questions array. You can add questions manually later.

## API Usage Limits

The free version of Gemini API has usage limits. Please refer to the [Google AI Studio documentation](https://ai.google.dev/docs/quotas_and_limits) for the latest information on quotas and limits.

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify that you've correctly copied the API key
   - Check that the API key is properly set in the `.env` file
   - Ensure the API key has not expired or been revoked

2. **No Questions Generated**
   - Check the server logs for error messages
   - Verify that the Gemini API is available and responding
   - Try adjusting the quiz parameters (e.g., simplify the category or reduce the number of questions)

3. **Poor Quality Questions**
   - Try adjusting the difficulty level
   - Provide more specific category and sub-category information
   - Modify the prompt template in `ai.service.js` to improve the instructions to the AI