import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkQuota } from '@/lib/subscription/quota-checker';
import { chatUpdateInventory } from '@/lib/ai/recipe-recommender';
import { logAiUsage } from '@/lib/ai/usage-logger';

const chatSchema = z.object({
  message: z.string().min(1).max(300),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    // 配額檢查
    const quota = await checkQuota(session.user.id, 'kitchen_chat');
    if (!quota.allowed) {
      return NextResponse.json(createErrorResponse('QUOTA_EXCEEDED', '已超過本月免費配額'), { status: 402 });
    }

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    // 取得庫存
    const inventory = await prisma.kitchenInventory.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, scanImages: [] },
      update: {},
      include: { ingredients: { where: { isAvailable: true } } },
    });

    // 傳入 {name, quantity} 數組，AI 才能正確做加減運算
    const currentIngredients = inventory.ingredients.map((i) => ({
      name: i.name,
      quantity: i.quantity,
    }));

    // AI 解析自然語言更新指令
    const result = await chatUpdateInventory(parsed.data.message, currentIngredients);

    // 記錄真實 token 用量
    logAiUsage({
      userId: session.user.id,
      feature: 'kitchen_chat',
      model: 'gpt-4.1-mini',
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    });

    // 套用更新
    for (const update of result.updates) {
      if (update.action === 'remove') {
        await prisma.kitchenIngredient.updateMany({
          where: {
            inventoryId: inventory.id,
            name: update.name,
            isAvailable: true,
          },
          data: { isAvailable: false },
        });
      } else if (update.action === 'add') {
        await prisma.kitchenIngredient.create({
          data: {
            inventoryId: inventory.id,
            name: update.name,
            category: update.category ?? '其他',
            quantity: update.quantity ?? '適量',
            addedVia: 'CHAT',
          },
        });
      } else if (update.action === 'update') {
        await prisma.kitchenIngredient.updateMany({
          where: {
            inventoryId: inventory.id,
            name: update.name,
            isAvailable: true,
          },
          data: { quantity: update.quantity ?? '適量' },
        });
      }
    }

    // 回傳更新後的庫存
    const updatedInventory = await prisma.kitchenInventory.findUnique({
      where: { userId: session.user.id },
      include: { ingredients: { where: { isAvailable: true } } },
    });

    return NextResponse.json(createSuccessResponse({
      reply: result.reply,
      updates: result.updates,
      inventory: updatedInventory,
    }));
  } catch (error) {
    console.error('Kitchen chat error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '對話更新失敗'), { status: 500 });
  }
}
