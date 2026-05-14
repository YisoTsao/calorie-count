import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { logAiUsage } from '@/lib/ai/usage-logger';
import {
  callFoodParser,
  buildConversationMessages,
  type ConversationMessage,
} from '@/lib/ai/food-parser';
import { checkQuota } from '@/lib/subscription/quota-checker';
import { z } from 'zod';

const requestSchema = z.object({
  message: z.string().min(1).max(500),
  sessionId: z.string().optional(),
  mealDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '輸入格式不正確', validation.error.issues),
        { status: 400 }
      );
    }

    const { message, sessionId, mealDate } = validation.data;
    const userId = session.user.id;

    // 配額檢查
    const quota = await checkQuota(userId, 'conversational_diary');
    if (!quota.allowed) {
      return NextResponse.json(
        createErrorResponse('QUOTA_EXCEEDED', '已超過本月免費配額', [
          { used: quota.used, limit: quota.limit, plan: quota.plan },
        ]),
        { status: 402 }
      );
    }

    // 取得或建立 ConversationSession
    let convSession = sessionId
      ? await prisma.conversationSession.findFirst({
          where: { id: sessionId, userId, status: 'ACTIVE' },
        })
      : null;

    if (sessionId && !convSession) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '對話不存在或已過期'),
        { status: 404 }
      );
    }

    const now = new Date();
    const mealDateTime = mealDate ? new Date(mealDate) : now;

    if (!convSession) {
      convSession = await prisma.conversationSession.create({
        data: {
          userId,
          messages: [],
          pendingFoods: [],
          mealDate: mealDateTime,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 天
        },
      });
    }

    // 建構對話歷史
    const history = (convSession.messages as unknown as ConversationMessage[]) || [];
    const messages = buildConversationMessages(history, message);

    // 呼叫 AI
    const result = await callFoodParser(messages, convSession.mealDate);

    // 更新 session
    const newHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', content: message, timestamp: now.toISOString() },
      {
        role: 'assistant',
        content: result.assistantMessage,
        timestamp: new Date().toISOString(),
        parsedFoods: result.parsedFoods,
      },
    ];

    await prisma.conversationSession.update({
      where: { id: convSession.id },
      data: {
        messages: newHistory as unknown as object[],
        pendingFoods: result.parsedFoods as unknown as object[],
        suggestedMealType: result.suggestedMealType,
      },
    });

    // 記錄 AI 用量
    logAiUsage({
      userId,
      feature: 'conversational_diary',
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      model: 'gpt-4o',
    });

    return NextResponse.json(
      createSuccessResponse({
        sessionId: convSession.id,
        assistantMessage: result.assistantMessage,
        parsedFoods: result.parsedFoods,
        suggestedMealType: result.suggestedMealType,
        needsClarification: result.needsClarification,
        clarificationPrompt: result.clarificationPrompt,
      })
    );
  } catch (error) {
    console.error('[AI Conversation] Error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'AI 對話處理失敗，請稍後再試'),
      { status: 500 }
    );
  }
}
