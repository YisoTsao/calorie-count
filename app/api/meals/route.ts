import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

interface MealWhereClause {
  userId: string;
  mealDate?: {
    gte?: Date;
    lt?: Date;
    lte?: Date;
  };
  mealType?: MealType;
}

interface NutritionAccumulator {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// ==================== GET: 查詢飲食記錄 ====================

const getMealsSchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD 格式
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const mealType = searchParams.get('mealType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 建立驗證物件(只包含有值的參數)
    const paramsToValidate: Record<string, string> = {};
    if (date) paramsToValidate.date = date;
    if (mealType) paramsToValidate.mealType = mealType;
    if (startDate) paramsToValidate.startDate = startDate;
    if (endDate) paramsToValidate.endDate = endDate;

    // 驗證參數
    const validation = getMealsSchema.safeParse(paramsToValidate);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    // 建立查詢條件
    const where: MealWhereClause = {
      userId: session.user.id,
    };

    // 如果指定特定日期
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.mealDate = {
        gte: targetDate,
        lt: nextDay,
      };
    }
    // 或是日期範圍
    else if (startDate && endDate) {
      where.mealDate = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }
    // 預設查詢今天
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      where.mealDate = {
        gte: today,
        lt: tomorrow,
      };
    }

    // 如果指定餐別
    if (mealType) {
      where.mealType = mealType as MealType;
    }

    // 查詢資料
    const meals = await prisma.meal.findMany({
      where,
      include: {
        foods: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { mealDate: 'desc' },
    });

    // 計算總營養素
    // 注意: 資料庫中的營養值已經是 baseValue * servings 的結果,不需要再乘
    const totals = meals.reduce(
      (acc: NutritionAccumulator, meal: (typeof meals)[number]) => {
        meal.foods.forEach((food: (typeof meal.foods)[number]) => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
          if (food.fiber) acc.fiber += food.fiber;
          if (food.sugar) acc.sugar += food.sugar;
          if (food.sodium) acc.sodium += food.sodium;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    return NextResponse.json(
      createSuccessResponse({
        meals,
        totals,
        count: meals.length,
      })
    );
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}

// ==================== POST: 新增飲食記錄 ====================

const createMealSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']),
  mealDate: z.string().optional(), // ISO 日期字串
  notes: z.string().optional(),
  foods: z
    .array(
      z.object({
        name: z.string().min(1, '食物名稱不能為空'),
        nameEn: z.string().optional(),
        portion: z.string().min(1, '份量描述不能為空'),
        portionSize: z.number().positive('份量必須大於 0'),
        portionUnit: z.string().min(1, '單位不能為空'),
        calories: z.number().min(0, '卡路里不能為負數'),
        protein: z.number().min(0, '蛋白質不能為負數'),
        carbs: z.number().min(0, '碳水化合物不能為負數'),
        fat: z.number().min(0, '脂肪不能為負數'),
        fiber: z.number().min(0).optional(),
        sugar: z.number().min(0).optional(),
        sodium: z.number().min(0).optional(),
        servings: z.number().positive().optional().default(1),
      })
    )
    .optional()
    .default([]), // 改為 optional,允許空陣列
  sourceRecognitionId: z.string().optional(), // 來源辨識記錄 ID
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const body = await req.json();

    // 驗證輸入
    const validation = createMealSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', firstError.message), {
        status: 400,
      });
    }

    const { mealType, mealDate, notes, foods, sourceRecognitionId } = validation.data;

    // 建立飲食記錄
    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        mealType,
        mealDate: mealDate ? new Date(mealDate) : new Date(),
        notes,
        sourceRecognitionId,
        foods: {
          create: foods.map((food) => ({
            name: food.name,
            nameEn: food.nameEn,
            portion: food.portion,
            portionSize: food.portionSize,
            portionUnit: food.portionUnit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            sugar: food.sugar,
            sodium: food.sodium,
            servings: food.servings || 1,
          })),
        },
      },
      include: {
        foods: true,
      },
    });

    return NextResponse.json(createSuccessResponse({ meal }), { status: 201 });
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '新增失敗'), { status: 500 });
  }
}
