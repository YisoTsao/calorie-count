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

const FOOD_RECOGNITION_PROMPT = `你是一個專業的營養師和食物辨識專家。請分析這張圖片中的食物,並以 JSON 格式回傳詳細的營養資訊。

請遵循以下規則:
1. 辨識圖片中所有可見的食物項目
2. 估算每項食物的份量(盡可能精確)
3. 提供完整的營養資訊(每份的數值)
4. 使用繁體中文作為主要語言
5. 如果無法確定某項資訊,請提供合理的估算值

回傳格式必須是有效的 JSON,格式如下:
{
  "foods": [
    {
      "name": "食物中文名稱",
      "nameEn": "Food English Name",
      "portion": "份量描述(例如: 一碗, 150克)",
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

注意事項:
- portionUnit 可以是: g, ml, 碗, 盤, 個, 杯, 片, 塊, 條等
- 所有營養素的單位: calories (kcal), protein/carbs/fat/fiber/sugar (g), sodium (mg)
- confidence 是 0-1 之間的數字,表示辨識的信心度
- 如果圖片中沒有食物,請回傳空的 foods 陣列

請開始分析這張圖片:`;

export async function recognizeFood(imageUrl: string): Promise<FoodRecognitionResult> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: FOOD_RECOGNITION_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // 使用高解析度分析
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

    // 解析 JSON 回應
    const result = JSON.parse(content);

    // 驗證回應格式
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
      throw new Error(`食物辨識失敗: ${error.message}`);
    }

    throw new Error('食物辨識過程發生未知錯誤');
  }
}

/**
 * 帶重試機制的食物辨識
 */
export async function recognizeFoodWithRetry(
  imageUrl: string,
  maxRetries = 2
): Promise<FoodRecognitionResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await recognizeFood(imageUrl);
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
 */
export function validateRecognitionResult(result: FoodRecognitionResult): boolean {
  if (!result.foods || result.foods.length === 0) {
    return false;
  }

  // 檢查每個食物項目是否有必要的欄位
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
