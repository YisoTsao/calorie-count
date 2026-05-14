import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const confirmSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']),
  foods: z.array(
    z.object({
      name: z.string(),
      portion: z.string(),
      portionSize: z.number(),
      portionUnit: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fiber: z.number().optional(),
    })
  ),
  mealDate: z.string().datetime().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // 驗證 session 所有權
    const convSession = await prisma.conversationSession.findFirst({
      where: { id, userId, status: 'ACTIVE' },
    });

    if (!convSession) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '對話不存在或已確認'),
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = confirmSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '輸入格式不正確', validation.error.issues),
        { status: 400 }
      );
    }

    const { mealType, foods, mealDate } = validation.data;
    const mealDateTime = mealDate ? new Date(mealDate) : convSession.mealDate;

    // 寫入 Meal + MealFood
    const meal = await prisma.meal.create({
      data: {
        userId,
        mealType,
        mealDate: mealDateTime,
        notes: '透過 AI 對話記錄',
        foods: {
          create: foods.map((f) => ({
            name: f.name,
            portion: f.portion,
            portionSize: f.portionSize,
            portionUnit: f.portionUnit,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            fiber: f.fiber ?? null,
            servings: 1.0,
          })),
        },
      },
      include: { foods: true },
    });

    // 更新 session 狀態
    await prisma.conversationSession.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedMealId: meal.id,
      },
    });

    return NextResponse.json(createSuccessResponse({ mealId: meal.id }), { status: 201 });
  } catch (error) {
    console.error('[AI Conversation Confirm] Error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '確認記錄失敗，請稍後再試'),
      { status: 500 }
    );
  }
}
