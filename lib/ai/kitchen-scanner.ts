import { z } from 'zod';
import { openai, AI_MODEL } from './openai-client';

// ── 型別定義 ────────────────────────────────────────────────

export interface ScannedIngredient {
  name: string;
  category: string;
  quantity: string;
  aiConfidence: number;
}

// ── Zod 驗證 ────────────────────────────────────────────────

const ingredientSchema = z.object({
  name: z.string().max(50),
  category: z.enum(['蛋白質', '蔬菜', '澱粉', '調味料', '乳製品', '水果', '其他']),
  quantity: z.string().max(30),
  aiConfidence: z.number().min(0).max(1),
});

const scanResultSchema = z.object({
  ingredients: z.array(ingredientSchema).max(30),
});

// ── System Prompt ───────────────────────────────────────────

const KITCHEN_SCAN_PROMPT = `你是一位食材辨識專家。請分析這張廚房/冰箱照片，列出所有可見的食材。

回應格式（JSON）：
{
  "ingredients": [
    {
      "name": "雞蛋",
      "category": "蛋白質",
      "quantity": "6個",
      "aiConfidence": 0.95
    }
  ]
}

規則：
1. 只列出明確可辨識的食材
2. quantity 用描述性文字（「半袋」「約3個」）
3. aiConfidence < 0.6 的食材仍列出，讓用戶確認
4. category 從以下選擇：蛋白質/蔬菜/澱粉/調味料/乳製品/水果/其他
5. 若看不到任何食材，回傳空陣列`;

export interface ScanResult {
  ingredients: ScannedIngredient[];
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

// ── 核心函式 ────────────────────────────────────────────────

async function scanSingleImage(imageUrl: string): Promise<{ ingredients: ScannedIngredient[]; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    max_completion_tokens: 1500,
    messages: [
      { role: 'system', content: KITCHEN_SCAN_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: '請分析這張照片中的食材。回傳 JSON。' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('AI 未回應');

  const parsed = JSON.parse(content);
  const validated = scanResultSchema.parse(parsed);
  const u = response.usage;
  return {
    ingredients: validated.ingredients,
    usage: {
      promptTokens: u?.prompt_tokens ?? 0,
      completionTokens: u?.completion_tokens ?? 0,
      totalTokens: u?.total_tokens ?? 0,
    },
  };
}

/**
 * 合併多張圖片的掃描結果，同名食材去重
 */
function mergeIngredients(items: ScannedIngredient[]): ScannedIngredient[] {
  const map = new Map<string, ScannedIngredient>();
  for (const item of items) {
    const existing = map.get(item.name);
    if (!existing || item.aiConfidence > existing.aiConfidence) {
      map.set(item.name, item);
    }
  }
  return Array.from(map.values());
}

/**
 * 掃描多張圖片，辨識食材（最多 5 張）
 * 回傳食材列表 + 加總 token 用量
 */
export async function recognizeIngredients(
  imageUrls: string[]
): Promise<ScanResult> {
  if (imageUrls.length === 0) return { ingredients: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  const urls = imageUrls.slice(0, 5);

  const results = await Promise.all(urls.map(scanSingleImage));
  const ingredients = mergeIngredients(results.flatMap((r) => r.ingredients));
  const usage = results.reduce(
    (acc, r) => ({
      promptTokens: acc.promptTokens + r.usage.promptTokens,
      completionTokens: acc.completionTokens + r.usage.completionTokens,
      totalTokens: acc.totalTokens + r.usage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );
  return { ingredients, usage };
}
