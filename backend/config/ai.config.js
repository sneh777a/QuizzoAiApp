/**
 * AI configuration for Gemini API
 */

module.exports = {
  // Gemini API key from environment variables
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Model configuration
  model: {
    name: 'gemini-2.0-flash',
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
};