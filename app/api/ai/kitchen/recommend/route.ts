import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { checkQuota } from '@/lib/subscription/quota-checker';
import { recommendRecipes } from '@/lib/ai/recipe-recommender';
import { calculateNutritionGap } from '@/lib/calculations/nutrition-gap';
import { logAiUsage } from '@/lib/ai/usage-logger';
import { startOfDay, subDays } from 'date-fns';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    // 配額檢查
    const quota = await checkQuota(session.user.id, 'recipe_recommend');
    if (!quota.allowed) {
      return NextResponse.json(createErrorResponse('QUOTA_EXCEEDED', '已超過本月免費配額'), { status: 402 });
    }

    // 取得庫存食材
    const inventory = await prisma.kitchenInventory.findUnique({
      where: { userId: session.user.id },
      include: {
        ingredients: {
          where: { isAvailable: true },
        },
      },
    });

    if (!inventory || inventory.ingredients.length === 0) {
      return NextResponse.json(createErrorResponse('NO_INGREDIENTS', '尚無食材庫存'), { status: 400 });
    }

    const ingredientNames = inventory.ingredients.map((i) => i.name);

    // 計算營養缺口
    const gap = await calculateNutritionGap(session.user.id);

    // 取得個人化 context（並行查詢，不阻塞主流程）
    const [goals, recentFoods, savedRecipes] = await Promise.all([
      prisma.userGoals.findUnique({ where: { userId: session.user.id }, select: { goalType: true } }),
      // MealFood.name 才是食物名稱；Meal 本身無 name 欄位
      prisma.mealFood.findMany({
        where: {
          meal: {
            userId: session.user.id,
            mealDate: { gte: startOfDay(subDays(new Date(), 3)) },
          },
        },
        select: { name: true },
        take: 30,
      }),
      prisma.savedRecipe.findMany({
        where: { userId: session.user.id },
        select: { name: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const context = {
      goalType: goals?.goalType ?? undefined,
      recentFoods: [...new Set(recentFoods.map((f) => f.name))],
      savedRecipeNames: savedRecipes.map((r) => r.name),
    };

    // AI 推薦料理（帶入個人化 context）
    const { recipes, usage } = await recommendRecipes(ingredientNames, gap, context);

    // 記錄真實 token 用量
    logAiUsage({
      userId: session.user.id,
      feature: 'recipe_recommend',
      model: 'gpt-4.1-mini',
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
    });

    return NextResponse.json(createSuccessResponse({ recipes, nutritionGap: gap }));
  } catch (error) {
    console.error('[recommend] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '推薦失敗'), { status: 500 });
  }
}
