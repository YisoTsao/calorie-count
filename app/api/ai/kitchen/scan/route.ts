import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkQuota } from '@/lib/subscription/quota-checker';
import { recognizeIngredients } from '@/lib/ai/kitchen-scanner';
import { logAiUsage } from '@/lib/ai/usage-logger';

const scanBodySchema = z.object({
  // 接受 base64 data URI（data:image/...）或 HTTPS URL
  images: z.array(z.string().min(10)).min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    // 配額檢查
    const quota = await checkQuota(session.user.id, 'kitchen_scan');
    if (!quota.allowed) {
      return NextResponse.json(createErrorResponse('QUOTA_EXCEEDED', '已超過本月免費配額'), { status: 402 });
    }

    // 驗證輸入
    const body = await req.json();
    const parsed = scanBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    const { images } = parsed.data;

    // AI 辨識食材（直接傳 base64 data URI，不依賴 OpenAI 能存取外部 URL）
    const scanResult = await recognizeIngredients(images);
    const ingredients = scanResult.ingredients;

    // 取得或建立庫存（scanImages 只存非 data URI 的持久化 URL）
    const persistedUrls = images.filter((u) => u.startsWith('http'));
    const inventory = await prisma.kitchenInventory.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        scanImages: persistedUrls,
        lastScannedAt: new Date(),
      },
      update: {
        scanImages: persistedUrls,
        lastScannedAt: new Date(),
      },
    });

  // 寫入食材（先清除舊的 SCAN 來源食材，再寫入新的）
  await prisma.kitchenIngredient.deleteMany({
    where: { inventoryId: inventory.id, addedVia: 'SCAN' },
  });

  if (ingredients.length > 0) {
    await prisma.kitchenIngredient.createMany({
      data: ingredients.map((ing) => ({
        inventoryId: inventory.id,
        name: ing.name,
        category: ing.category,
        quantity: ing.quantity,
        aiConfidence: ing.aiConfidence,
        addedVia: 'SCAN' as const,
      })),
    });
  }

  // 記錄真實 token 用量
  logAiUsage({
    userId: session.user.id,
    feature: 'kitchen_scan',
    model: 'gpt-4.1-mini',
    promptTokens: scanResult.usage.promptTokens,
    completionTokens: scanResult.usage.completionTokens,
    totalTokens: scanResult.usage.totalTokens,
  });

    // 回傳完整庫存
    const result = await prisma.kitchenInventory.findUnique({
      where: { userId: session.user.id },
      include: { ingredients: { where: { isAvailable: true } } },
    });

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Kitchen scan error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', process.env.NODE_ENV === 'development' ? `掃描失敗: ${msg}` : '掃描失敗'),
      { status: 500 }
    );
  }
}
