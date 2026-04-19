import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import { GoalType } from '@prisma/client';

// ==================== GET: 查詢使用者目標 ====================

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '請先登入'),
        { status: 401 }
      );
    }

    // 查詢使用者目標和個人資料
    const [goals, profile] = await Promise.all([
      prisma.userGoals.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    // 如果沒有目標，建立預設目標
    if (!goals) {
      const defaultGoals = await prisma.userGoals.create({
        data: {
          userId: session.user.id,
          goalType: 'MAINTAIN',
          dailyCalorieGoal: 2000,
          proteinGoal: 50,
          carbsGoal: 250,
          fatGoal: 65,
          waterGoal: 2000,
        },
      });

      return NextResponse.json(
        createSuccessResponse({ goals: defaultGoals, profile })
      );
    }

    return NextResponse.json(createSuccessResponse({ goals, profile }));
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '查詢失敗'),
      { status: 500 }
    );
  }
}

// ==================== POST/PATCH: 更新使用者目標 ====================

const updateGoalsSchema = z.object({
  goalType: z.enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN']).optional(),
  dailyCalorieGoal: z.number().int().min(1000).max(5000).optional(),
  proteinGoal: z.number().min(0).max(500).optional(),
  carbsGoal: z.number().min(0).max(1000).optional(),
  fatGoal: z.number().min(0).max(300).optional(),
  waterGoal: z.number().int().min(0).max(10000).optional(),
  exerciseGoal: z.number().int().min(0).max(600).optional(),
  targetDate: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '請先登入'),
        { status: 401 }
      );
    }

    const body = await req.json();

    // 驗證輸入
    const validation = updateGoalsSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', firstError.message),
        { status: 400 }
      );
    }

    const { goalType, dailyCalorieGoal, proteinGoal, carbsGoal, fatGoal, waterGoal, exerciseGoal, targetDate } =
      validation.data;

    // 檢查是否已有目標
    const existingGoals = await prisma.userGoals.findUnique({
      where: { userId: session.user.id },
    });

    let goals;

    if (existingGoals) {
      // 更新現有目標
      goals = await prisma.userGoals.update({
        where: { userId: session.user.id },
        data: {
          ...(goalType && { goalType: goalType as GoalType }),
          ...(dailyCalorieGoal !== undefined && { dailyCalorieGoal }),
          ...(proteinGoal !== undefined && { proteinGoal }),
          ...(carbsGoal !== undefined && { carbsGoal }),
          ...(fatGoal !== undefined && { fatGoal }),
          ...(waterGoal !== undefined && { waterGoal }),
          ...(exerciseGoal !== undefined && { exerciseGoal }),
          ...(targetDate !== undefined && {
            targetDate: targetDate ? new Date(targetDate) : null,
          }),
        },
      });
    } else {
      // 建立新目標
      goals = await prisma.userGoals.create({
        data: {
          userId: session.user.id,
          goalType: (goalType as GoalType) || 'MAINTAIN',
          dailyCalorieGoal: dailyCalorieGoal || 2000,
          proteinGoal: proteinGoal || 50,
          carbsGoal: carbsGoal || 250,
          fatGoal: fatGoal || 65,
          waterGoal: waterGoal || 2000,
          exerciseGoal: exerciseGoal || 30,
          ...(targetDate && { targetDate: new Date(targetDate) }),
        },
      });
    }

    return NextResponse.json(createSuccessResponse({ goals }));
  } catch (error) {
    console.error('Update goals error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '更新失敗'),
      { status: 500 }
    );
  }
}
