import { z } from 'zod';
import { openai, AI_MODEL_CONVERSATION, CONVERSATION_MAX_TOKENS } from './openai-client';

// ── 型別定義 ────────────────────────────────────────────────

export interface ParsedFood {
  name: string;
  portion: string;
  portionSize: number;
  portionUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
  isFuzzy: boolean;
}

export interface ConversationTurn {
  assistantMessage: string;
  parsedFoods: ParsedFood[];
  suggestedMealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
  needsClarification: boolean;
  clarificationPrompt: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parsedFoods?: ParsedFood[];
}

// ── Zod 驗證 ────────────────────────────────────────────────

const parsedFoodSchema = z.object({
  name: z.string().max(50),
  portion: z.string().max(30),
  portionSize: z.number().min(0).max(5000),
  portionUnit: z.string().max(10),
  calories: z.number().min(0).max(2000),
  protein: z.number().min(0).max(200),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(200),
  fiber: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
  isFuzzy: z.boolean(),
});

const aiResponseSchema = z.object({
  assistantMessage: z.string(),
  parsedFoods: z.array(parsedFoodSchema),
  suggestedMealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']),
  needsClarification: z.boolean(),
  clarificationPrompt: z.string().nullable(),
});

// ── 常數 ────────────────────────────────────────────────────

const MAX_HISTORY_TURNS = 10;
const MAX_MESSAGE_LENGTH = 500;

// ── System Prompt ────────────────────────────────────────────

function buildSystemPrompt(currentTime: string): string {
  return `你是一位精通台灣飲食文化的營養師 AI，負責從用戶的自然語言描述中精確解析食物與營養資訊。

【回應規則】
1. 必須以 JSON 格式回應，不要包含 markdown 或額外文字
2. 使用繁體中文作為食物名稱
3. 對於台灣常見食物（牛肉麵、滷肉飯、雞排等），使用在地標準份量與熱量估算
4. 若描述模糊（「大概」「一點」「幾口」），isFuzzy 設為 true，並給出保守估算
5. 若食物資訊不足以估算，needsClarification 設為 true，並在 clarificationPrompt 中詢問
6. 若用戶修正先前的描述（如「不對，是大碗」），以最新描述為準，重新計算所有食物

【JSON 結構】
{
  "assistantMessage": "我幫你記錄了...",
  "parsedFoods": [
    {
      "name": "牛肉麵",
      "portion": "一碗",
      "portionSize": 450,
      "portionUnit": "g",
      "calories": 520,
      "protein": 28,
      "carbs": 65,
      "fat": 15,
      "fiber": 3,
      "confidence": 0.85,
      "isFuzzy": false
    }
  ],
  "suggestedMealType": "LUNCH",
  "needsClarification": false,
  "clarificationPrompt": null
}

【餐別判斷邏輯】
- 05:00–10:30 → BREAKFAST
- 10:30–14:00 → LUNCH
- 14:00–17:00 → SNACK
- 17:00–21:00 → DINNER
- 21:00–05:00 → SNACK（消夜）
當前時間：${currentTime}`;
}

// ── 輸入清理 ────────────────────────────────────────────────

function sanitizeUserMessage(message: string): string {
  const truncated = message.slice(0, MAX_MESSAGE_LENGTH);
  return truncated.replace(/^(system|assistant):\s*/i, '');
}

// ── 訊息建構 ────────────────────────────────────────────────

export function buildConversationMessages(
  history: ConversationMessage[],
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const recent = history
    .slice(-MAX_HISTORY_TURNS * 2)
    .map((m) => ({ role: m.role, content: m.content }));

  return [...recent, { role: 'user' as const, content: sanitizeUserMessage(newMessage) }];
}

// ── 主要解析函式 ────────────────────────────────────────────

export async function callFoodParser(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  mealDate: Date
): Promise<ConversationTurn> {
  const currentTime = mealDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  });

  const response = await openai.chat.completions.create({
    model: AI_MODEL_CONVERSATION,
    max_completion_tokens: CONVERSATION_MAX_TOKENS,
    messages: [
      { role: 'system', content: buildSystemPrompt(currentTime) },
      ...messages,
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 未回傳內容');
  }

  const parsed = JSON.parse(content);
  const validated = aiResponseSchema.parse(parsed);

  const usage = response.usage;

  return {
    ...validated,
    usage: {
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    },
  };
}
