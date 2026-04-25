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
    });

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { servings } = validation.data;

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
    const baseCalories = mealFood.calories / mealFood.servings;
    const baseProtein = mealFood.protein / mealFood.servings;
    const baseCarbs = mealFood.carbs / mealFood.servings;
    const baseFat = mealFood.fat / mealFood.servings;

    // Update meal food
    const updated = await prisma.mealFood.update({
      where: { id: mealFoodId },
      data: {
        servings,
        portionSize: (mealFood.portionSize / mealFood.servings) * servings,
        portion: `${((mealFood.portionSize / mealFood.servings) * servings).toFixed(0)} ${mealFood.portionUnit}`,
        calories: baseCalories * servings,
        protein: baseProtein * servings,
        carbs: baseCarbs * servings,
        fat: baseFat * servings,
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
