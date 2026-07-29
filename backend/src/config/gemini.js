import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-google-gemini-api-key') {
  console.warn('⚠️ GEMINI_API_KEY is not set or using placeholder. Fallback AI responses will be enabled.');
}

export const ai = (apiKey && apiKey !== 'your-google-gemini-api-key')
  ? new GoogleGenAI({ apiKey })
  : null;

export const GEMINI_MODEL = 'gemini-2.5-flash';
