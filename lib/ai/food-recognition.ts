import { openai, AI_MODEL, MAX_TOKENS } from './openai-client';

export interface RecognizedFood {
  name: string;
  nameEn?: string;
  portion: string;
  portionSize: number;
  portionUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence?: number;
}

export interface FoodRecognitionResult {
  foods: RecognizedFood[];
  confidence: number;
  rawResponse: unknown;
  usageStats?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ── 簡化的語言指令（避免重複） ────────────────────────────────────
const LANGUAGE_CODES: Record<string, { lang: string; example: string }> = {
  'zh-TW': { lang: 'Traditional Chinese (繁體中文)', example: '炒飯' },
  'zh-CN': { lang: 'Simplified Chinese (简体中文)', example: '炒饭' },
  zh: { lang: 'Traditional Chinese (繁體中文)', example: '炒飯' },
  en: { lang: 'English', example: 'Fried Rice' },
  ja: { lang: 'Japanese (日本語)', example: 'チャーハン' },
  ko: { lang: 'Korean (한국어)', example: '볶음밥' },
  fr: { lang: 'French (Français)', example: 'Riz sauté' },
  es: { lang: 'Spanish (Español)', example: 'Arroz frito' },
  de: { lang: 'German (Deutsch)', example: 'Gebratener Reis' },
};

function getLanguageInfo(locale: string): { lang: string; example: string } {
  return (
    LANGUAGE_CODES[locale] ??
    LANGUAGE_CODES[locale.split('-')[0]] ??
    LANGUAGE_CODES['en']
  );
}

// ── 錯誤訊息 i18n ──────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  'zh-TW': '食物辨識失敗',
  'zh-CN': '食物识别失败',
  zh: '食物辨識失敗',
  en: 'Food recognition failed',
  ja: '食品認識に失敗しました',
  ko: '음식 인식 실패',
  fr: 'Échec de la reconnaissance',
  es: 'Error de reconocimiento',
  de: 'Erkennung fehlgeschlagen',
};

function getErrorMessage(locale: string): string {
  return (
    ERROR_MESSAGES[locale] ??
    ERROR_MESSAGES[locale.split('-')[0]] ??
    ERROR_MESSAGES['en']
  );
}

// ── Prompt 建構 ────────────────────────────────────────────────
function buildSystemPrompt(locale: string): string {
  const info = getLanguageInfo(locale);
  return `You are a professional food nutritionist. Return JSON only, no markdown or extra text.

Respond in ${info.lang}. Example: "name": "${info.example}".

Return valid JSON matching this structure:
{
  "foods": [
    {
      "name": "<food name in ${info.lang}>",
      "nameEn": "<English name>",
      "portion": "<serving in ${info.lang}>",
      "portionSize": <number>,
      "portionUnit": "g|ml|個",
      "calories": <number>,
      "protein": <number>,
      "carbs": <number>,
      "fat": <number>,
      "fiber": <number>,
      "sugar": <number>,
      "sodium": <number>,
      "confidence": <0-1>
    }
  ],
  "confidence": <0-1>
}`;
}

function buildUserPrompt(locale: string): string {
  return `Analyze the food in this image. Return valid JSON only (no markdown, no explanation).\n\nRules: calories=kcal, protein/carbs/fat/fiber/sugar=g, sodium=mg. Return empty foods array if no food visible.`;
}

export async function recognizeFood(
  imageUrl: string,
  locale = 'zh-TW'
): Promise<FoodRecognitionResult> {
  const errorMsg = getErrorMessage(locale);

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_completion_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(locale),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildUserPrompt(locale),
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    const finishReason = response.choices[0]?.finish_reason;

    // 偵測 token 不足（回應被截斷）
    if (finishReason === 'length') {
      throw new Error('Response truncated: increase MAX_TOKENS');
    }

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);

    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }

    const usage = response.usage;

    return {
      foods: result.foods,
      confidence: result.confidence || 0.5,
      rawResponse: response,
      usageStats: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Food recognition error:', error);

    if (error instanceof Error) {
      throw new Error(`${errorMsg}: ${error.message}`);
    }

    throw new Error(errorMsg);
  }
}

/**
 * 帶快速失敗的重試機制
 */
export async function recognizeFoodWithRetry(
  imageUrl: string,
  maxRetries = 1,
  locale = 'zh-TW'
): Promise<FoodRecognitionResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await recognizeFood(imageUrl, locale);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Attempt ${attempt + 1}/${maxRetries + 1}]`, lastError.message);

      if (attempt < maxRetries) {
        // 指數退避但更短（1.5 秒）
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError || new Error('Food recognition failed after retries');
}

/**
 * 驗證辨識結果
 * - 空 foods 陣列視為「無法辨識出食物」，仍屬有效結果（不拋出錯誤）
 * - 只有在 foods 陣列存在但食物缺少必要欄位時才回傳 false
 */
export function validateRecognitionResult(result: FoodRecognitionResult): boolean {
  if (!result || typeof result !== 'object') return false;
  if (!Array.isArray(result.foods)) return false;

  // 空陣列 = 未偵測到食物，屬於正常情況
  if (result.foods.length === 0) return true;

  // 有食物時，確認必要欄位存在
  return result.foods.every((food) => {
    return (
      food.name &&
      food.portion &&
      typeof food.portionSize === 'number' &&
      food.portionUnit &&
      typeof food.calories === 'number' &&
      typeof food.protein === 'number' &&
      typeof food.carbs === 'number' &&
      typeof food.fat === 'number'
    );
  });
}
