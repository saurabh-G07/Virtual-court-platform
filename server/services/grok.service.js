const axios = require('axios');

// Grok/Groq API Base URL and Key (Using Groq API since the key is gsk_)
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY;

/**
 * Summarize a court case transcript using Grok/Groq AI.
 * @param {string} transcript - The full transcript text.
 * @returns {Promise<string>} - The summarized text.
 */
exports.summarizeCase = async (transcript) => {
  try {
    if (!GROK_API_KEY) {
      console.warn('GROK_API_KEY is not set. Skipping AI summarization.');
      return 'Summary not available (API key missing).';
    }

    const response = await axios.post(
      GROK_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: 'You are an AI legal assistant. Please provide a concise summary of the following court hearing transcript. Focus on key arguments, decisions, and evidence presented.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        model: 'mixtral-8x7b-32768', // Groq fast model
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to generate summary using Grok API.');
  }
};
