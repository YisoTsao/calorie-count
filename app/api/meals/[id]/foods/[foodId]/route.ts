import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// PATCH /api/meals/[id]/foods/[foodId] - Update meal food servings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; foodId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: mealId, foodId: mealFoodId } = await params;

    // Verify meal exists and belongs to user
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      select: { id: true, userId: true },
    });

    if (!meal) {
      return NextResponse.json({ error: '找不到此餐次' }, { status: 404 });
    }

    if (meal.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限修改此餐次' }, { status: 403 });
    }

    // Validate request body
    const updateSchema = z.object({
      servings: z.number().min(0.1).max(50),
      // 可選：直接覆蓋各欄位（允許手動修正 AI 辨識結果）
      name: z.string().min(1).max(200).optional(),
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
      portionSize: z.number().min(0).optional(),
      portionUnit: z.string().max(20).optional(),
    });

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { servings, name, calories, protein, carbs, fat, portionSize, portionUnit } =
      validation.data;

    // Find meal food
    const mealFood = await prisma.mealFood.findFirst({
      where: {
        id: mealFoodId,
        mealId,
      },
    });

    if (!mealFood) {
      return NextResponse.json({ error: '找不到此食物' }, { status: 404 });
    }

    // Calculate nutrition values based on new servings
    // 若有直接傳入 per-serving 值，使用傳入值；否則從原始記錄反推
    const resolvedCalories = calories ?? mealFood.calories / mealFood.servings;
    const resolvedProtein = protein ?? mealFood.protein / mealFood.servings;
    const resolvedCarbs = carbs ?? mealFood.carbs / mealFood.servings;
    const resolvedFat = fat ?? mealFood.fat / mealFood.servings;
    const resolvedPortionSize = portionSize ?? mealFood.portionSize / mealFood.servings;
    const resolvedPortionUnit = portionUnit ?? mealFood.portionUnit;

    // Update meal food
    const updated = await prisma.mealFood.update({
      where: { id: mealFoodId },
      data: {
        ...(name !== undefined ? { name } : {}),
        servings,
        portionSize: resolvedPortionSize * servings,
        portionUnit: resolvedPortionUnit,
        portion: `${(resolvedPortionSize * servings).toFixed(0)} ${resolvedPortionUnit}`,
        calories: resolvedCalories * servings,
        protein: resolvedProtein * servings,
        carbs: resolvedCarbs * servings,
        fat: resolvedFat * servings,
      },
    });

    return NextResponse.json({
      success: true,
      data: { mealFood: updated },
    });
  } catch (error) {
    console.error('Update meal food error:', error);
    return NextResponse.json({ error: '更新食物失敗' }, { status: 500 });
  }
}
