import { prisma } from '@/lib/prisma';
import { AI_MODEL } from './openai-client';

// 模型定價（USD per 1K tokens）
// 更新自：https://openai.com/pricing（2026-05-06）
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini':  { input: 0.00015, output: 0.0006 },
  'gpt-4.1-mini': { input: 0.0004,  output: 0.0016 },
  'gpt-4o':       { input: 0.0025,  output: 0.01 },
  'gpt-4-turbo':  { input: 0.01,    output: 0.03 },
};

function calcCost(model: string, promptTokens: number, completionTokens: number): number {
  const price = PRICING[model] ?? PRICING['gpt-4o-mini'];
  return (promptTokens / 1000) * price.input + (completionTokens / 1000) * price.output;
}

export interface LogAiUsageParams {
  userId: string;
  feature: 'food_recognition' | 'nutrition_chat' | 'conversational_diary' | 'kitchen_scan' | 'recipe_recommend' | 'kitchen_chat';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  locale?: string;
  recognitionId?: string;
  model?: string;
}

/** 記錄 AI 用量（fire-and-forget，不阻塞主流程） */
export function logAiUsage(params: LogAiUsageParams): void {
  const model = params.model ?? AI_MODEL;
  const cost = calcCost(model, params.promptTokens, params.completionTokens);

  try {
    void prisma.aiUsageLog
      .create({
        data: {
          userId: params.userId,
          feature: params.feature,
          model,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens: params.totalTokens,
          estimatedCostUsd: cost,
          locale: params.locale ?? null,
          recognitionId: params.recognitionId ?? null,
        },
      })
      .catch((err: unknown) => console.error('[AI Usage] Failed to log:', err));
  } catch (err) {
    // 靜默失敗，不影響主流程（例如 Prisma client 尚未包含此 model）
    console.error('[AI Usage] Sync error:', err);
  }
}

export interface MonthlyUsage {
  totalTokens: number;
  totalCostUsd: number;
  callCount: number;
}

/** 查詢某 user 本月累計用量 */
export async function getMonthlyUsage(userId: string): Promise<MonthlyUsage> {
  const result = await prisma.aiUsageLog.aggregate({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { totalTokens: true, estimatedCostUsd: true },
    _count: { id: true },
  });

  return {
    totalTokens: result._sum.totalTokens ?? 0,
    totalCostUsd: Number(result._sum.estimatedCostUsd ?? 0),
    callCount: result._count.id,
  };
}
