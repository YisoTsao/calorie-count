import { z } from 'zod';
import { openai, AI_MODEL, AI_MODEL_CONVERSATION, MAX_TOKENS } from './openai-client';
import type { NutritionGap } from '@/lib/calculations/nutrition-gap';

export interface PersonalContext {
  goalType?: string;          // e.g. 'LOSE_WEIGHT', 'GAIN_MUSCLE', 'MAINTAIN'
  recentFoods?: string[];     // 近 3 天吃過的食物名稱（避免重複）
  savedRecipeNames?: string[]; // 已收藏的菜名（提示多樣性）
}

// ── 型別定義 ────────────────────────────────────────────────

export interface Recipe {
  name: string;
  matchScore: number;
  cookTime: string;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  usedIngredients: string[];
  missingIngredients: string[];
  steps: string[];
}

// ── Zod 驗證 ────────────────────────────────────────────────

const recipeSchema = z.object({
  name: z.string().max(100),
  matchScore: z.number().min(0).max(100),
  cookTime: z.string().max(30),
  difficulty: z.string().max(20),
  calories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(500),
  usedIngredients: z.array(z.string()),
  missingIngredients: z.array(z.string()),
  steps: z.array(z.string()),
});

const recipeResponseSchema = z.object({
  recipes: z.array(recipeSchema).max(5),
});

// ── System Prompt ───────────────────────────────────────────

function buildRecipePrompt(
  ingredients: string[],
  gap: NutritionGap,
  context?: PersonalContext
): string {
  const goalLabels: Record<string, string> = {
    LOSE_WEIGHT: '減重（低卡、高飽足感）',
    GAIN_MUSCLE: '增肌（高蛋白、足量碳水）',
    MAINTAIN: '維持體重（均衡飲食）',
    IMPROVE_HEALTH: '改善健康（原型食物、低加工）',
  };
  const goalHint = context?.goalType ? goalLabels[context.goalType] ?? '均衡飲食' : '均衡飲食';
  const recentFoodsHint = context?.recentFoods?.length
    ? `\n近 3 天已吃過（盡量推薦不同的）：${context.recentFoods.join('、')}`
    : '';
  const savedHint = context?.savedRecipeNames?.length
    ? `\n已收藏菜單（請勿重複推薦）：${context.savedRecipeNames.slice(0, 10).join('、')}`
    : '';

  return `你是一位家庭料理推薦專家。根據用戶現有食材、營養缺口和個人目標，推薦最適合的料理。

用戶現有食材：${ingredients.join('、')}

今日營養缺口（剩餘需攝取）：
- 熱量：${Math.round(gap.caloriesRemaining)} kcal
- 蛋白質：${Math.round(gap.proteinRemaining)} g
- 碳水：${Math.round(gap.carbsRemaining)} g
- 脂肪：${Math.round(gap.fatRemaining)} g

用戶目標：${goalHint}${recentFoodsHint}${savedHint}

回應格式（JSON）：
{
  "recipes": [
    {
      "name": "蒜炒豆腐佐炒蛋",
      "matchScore": 92,
      "cookTime": "15 分鐘",
      "difficulty": "簡單",
      "calories": 380,
      "protein": 28,
      "carbs": 12,
      "fat": 18,
      "usedIngredients": ["豆腐", "雞蛋", "蒜"],
      "missingIngredients": [],
      "steps": ["步驟1...", "步驟2..."]
    }
  ]
}

規則：
1. 推薦 5 道【風格各異】的料理：3道快炒、1道湯品或燉煮、1道其他（涼拌、蒸、烤）
2. matchScore 代表食材吻合度（0-100%）
3. 優先推薦能補足營養缺口且符合用戶目標的料理
4. 偏好簡單、家常的台灣料理
5. 若食材不足以做任何料理，推薦只需少量額外食材的選項
6. 每次推薦的料理名稱必須不同，不可重複推薦同一道`;
}

/**
 * 根據現有食材和營養缺口推薦料理
 * 回傳食譜 + token 用量
 */
export async function recommendRecipes(
  ingredients: string[],
  gap: NutritionGap,
  context?: PersonalContext
): Promise<{ recipes: Recipe[]; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  if (ingredients.length === 0) return { recipes: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };

  const response = await openai.chat.completions.create({
    model: AI_MODEL_CONVERSATION, // gpt-4o：食譜推薦需要更好的創意與多樣性
    max_completion_tokens: MAX_TOKENS,
    temperature: 0.9, // 提高多樣性，避免每次推薦相同料理
    messages: [
      {
        role: 'system',
        content: buildRecipePrompt(ingredients, gap, context),
      },
      {
        role: 'user',
        content: '請根據我的食材和營養缺口推薦料理。回傳 JSON。',
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('AI 未回應');

  const parsed = JSON.parse(content);
  const validated = recipeResponseSchema.parse(parsed);
  const u = response.usage;
  return {
    recipes: validated.recipes,
    usage: {
      promptTokens: u?.prompt_tokens ?? 0,
      completionTokens: u?.completion_tokens ?? 0,
      totalTokens: u?.total_tokens ?? 0,
    },
  };
}

export interface InventoryItem {
  name: string;
  quantity: string;
}

/**
 * 廚房對話：自然語言更新庫存（如 "雞蛋用完了" "買了一包牛肉"）
 * @returns updates + reply + usage（token 數）
 */
export async function chatUpdateInventory(
  message: string,
  currentIngredients: InventoryItem[]
): Promise<{
  updates: Array<{ name: string; action: 'add' | 'remove' | 'update'; quantity?: string; category?: string }>;
  reply: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  const sanitized = message.slice(0, 300);

  // 傳入「名稱 數量」格式，AI 才能做增減運算（如「再加1顆」需知道原本3顆）
  const inventoryText = currentIngredients.length > 0
    ? currentIngredients.map((i) => `${i.name} ${i.quantity}`).join('、')
    : '（空）';

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    max_completion_tokens: 800,
    messages: [
      {
        role: 'system',
        content: `你是食材庫存管理助手。用戶會用自然語言告訴你食材的變化。

目前庫存食材（名稱 數量）：${inventoryText}

【重要規則】
- 若用戶說「再加 N 個/顆/...」，將現有數量加 N，用 update action 更新
- 若用戶說「總共有 N 個」，直接用 N 更新
- 若用戶說「用完了/沒了/刪除」，用 remove action
- 若用戶說「買了/新增」一個不存在的食材，用 add action
- quantity 必須是具體描述，如「4顆」「3包」「半袋」

回應格式（JSON）：
{
  "updates": [
    { "name": "雞蛋", "action": "update", "quantity": "4顆" },
    { "name": "牛肉", "action": "add", "quantity": "一包", "category": "蛋白質" }
  ],
  "reply": "好的！雞蛋更新為4顆。"
}

action: add=新增, remove=標記用完, update=修改數量
category 選項：蛋白質/蔬菜/澱粉/調味料/乳製品/水果/其他`,
      },
      { role: 'user', content: sanitized },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('AI 未回應');

  const data = JSON.parse(content);
  const usage = response.usage;
  return {
    ...data,
    usage: {
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    },
  };
}
