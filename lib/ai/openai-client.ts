import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = 'gpt-4o-mini'; // 使用 GPT-4 Vision 的經濟版本
export const MAX_TOKENS = 1000;
export const TEMPERATURE = 0.3; // 較低的溫度以獲得更一致的結果
