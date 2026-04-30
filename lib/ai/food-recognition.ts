import { openai, AI_MODEL, MAX_TOKENS, TEMPERATURE } from './openai-client';

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
}

// ── 語言指令對照表 ─────────────────────────────────────────────
const LANGUAGE_INSTRUCTION: Record<string, string> = {
  'zh-TW': 'You MUST respond in Traditional Chinese (繁體中文). ALL "name" and "portion" fields MUST be in Traditional Chinese. Example: "name": "炒飯". DO NOT use Simplified Chinese, Japanese, or English for these fields.',
  'zh-CN': 'You MUST respond in Simplified Chinese (简体中文). ALL "name" and "portion" fields MUST be in Simplified Chinese. Example: "name": "炒饭". DO NOT use Traditional Chinese, Japanese, or English for these fields.',
  'zh':    'You MUST respond in Traditional Chinese (繁體中文). ALL "name" and "portion" fields MUST be in Traditional Chinese.',
  'en':    'You MUST respond in English. ALL "name" and "portion" fields MUST be in English. Example: "name": "Fried Rice". DO NOT use any other language for these fields.',
  'ja':    'You MUST respond in Japanese (日本語). ALL "name" and "portion" fields MUST be in Japanese (Kanji/Kana). Example: "name": "チャーハン". DO NOT use Chinese or English for these fields.',
  'ko':    'You MUST respond in Korean (한국어). ALL "name" and "portion" fields MUST be in Korean. Example: "name": "볶음밥". DO NOT use any other language for these fields.',
  'fr':    'You MUST respond in French (Français). ALL "name" and "portion" fields MUST be in French. Example: "name": "Riz sauté". DO NOT use any other language for these fields.',
  'es':    'You MUST respond in Spanish (Español). ALL "name" and "portion" fields MUST be in Spanish. Example: "name": "Arroz frito". DO NOT use any other language for these fields.',
  'de':    'You MUST respond in German (Deutsch). ALL "name" and "portion" fields MUST be in German. Example: "name": "Gebratener Reis". DO NOT use any other language for these fields.',
};

// fallback：完整 locale → 語言前綴 → English
function getLanguageInstruction(locale: string): string {
  return (
    LANGUAGE_INSTRUCTION[locale] ??
    LANGUAGE_INSTRUCTION[locale.split('-')[0]] ??
    LANGUAGE_INSTRUCTION['en']
  );
}

// ── 錯誤訊息 i18n ──────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, { failed: string; unknown: string }> = {
  'zh-TW': { failed: '食物辨識失敗',           unknown: '食物辨識過程發生未知錯誤' },
  'zh-CN': { failed: '食物识别失败',           unknown: '食物识别过程发生未知错误' },
  'zh':    { failed: '食物辨識失敗',           unknown: '食物辨識過程發生未知錯誤' },
  'en':    { failed: 'Food recognition failed', unknown: 'Unknown error during food recognition' },
  'ja':    { failed: '食品認識に失敗しました',   unknown: '食品認識中に不明なエラーが発生しました' },
  'ko':    { failed: '음식 인식 실패',          unknown: '음식 인식 중 알 수 없는 오류 발생' },
  'fr':    { failed: 'Échec de la reconnaissance', unknown: 'Erreur inconnue lors de la reconnaissance' },
  'es':    { failed: 'Error de reconocimiento', unknown: 'Error desconocido durante el reconocimiento' },
  'de':    { failed: 'Erkennung fehlgeschlagen', unknown: 'Unbekannter Fehler bei der Erkennung' },
};

function getErrorMessages(locale: string) {
  return (
    ERROR_MESSAGES[locale] ??
    ERROR_MESSAGES[locale.split('-')[0]] ??
    ERROR_MESSAGES['en']
  );
}

// ── Prompt 建構 ────────────────────────────────────────────────
function buildSystemPrompt(locale: string): string {
  const langInstruction = getLanguageInstruction(locale);
  return `You are a professional nutritionist and food recognition expert.

⚠️ ABSOLUTE REQUIREMENT: ${langInstruction}

This language requirement overrides everything else. You MUST follow it strictly.`;
}

function buildUserPrompt(locale: string): string {
  const langInstruction = getLanguageInstruction(locale);
  return `Analyze the food in this image and return nutritional information as valid JSON only.

⚠️ Language reminder: ${langInstruction}

JSON structure (no extra text, no markdown, valid JSON only):
{
  "foods": [
    {
      "name": "<food name in the REQUIRED language>",
      "nameEn": "<food name in English>",
      "portion": "<serving description in the REQUIRED language>",
      "portionSize": 150,
      "portionUnit": "g",
      "calories": 200,
      "protein": 8.5,
      "carbs": 30.2,
      "fat": 5.3,
      "fiber": 2.1,
      "sugar": 3.5,
      "sodium": 450,
      "confidence": 0.85
    }
  ],
  "confidence": 0.85
}

Rules: calories (kcal), protein/carbs/fat/fiber/sugar (g), sodium (mg). Return empty foods array if no food visible.`;
}

export async function recognizeFood(imageUrl: string, locale = 'zh-TW'): Promise<FoodRecognitionResult> {
  const errors = getErrorMessages(locale);

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
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
                detail: 'auto',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);

    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }

    return {
      foods: result.foods,
      confidence: result.confidence || 0.5,
      rawResponse: response,
    };
  } catch (error) {
    console.error('Food recognition error:', error);

    if (error instanceof Error) {
      throw new Error(`${errors.failed}: ${error.message}`);
    }

    throw new Error(errors.unknown);
  }
}

/**
 * 帶重試機制的食物辨識
 */
export async function recognizeFoodWithRetry(
  imageUrl: string,
  maxRetries = 2,
  locale = 'zh-TW'
): Promise<FoodRecognitionResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await recognizeFood(imageUrl, locale);
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // 等待後重試 (指數退避)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  throw lastError || new Error('食物辨識失敗');
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
