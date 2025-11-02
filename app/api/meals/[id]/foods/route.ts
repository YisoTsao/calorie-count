import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/meals/[id]/foods - Add food to meal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: mealId } = await params;

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

    // Validate request body - support two modes:
    // 1. From existing food (foodId + servings)
    // 2. From recognition (direct nutrition data)
    const addFoodFromDbSchema = z.object({
      foodId: z.string().min(1),
      servings: z.number().min(0.1).max(50),
      portion: z.string().optional(),
      notes: z.string().max(500).optional(),
    });

    const addFoodDirectSchema = z.object({
      foodName: z.string().min(1),
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      servings: z.number().min(0.1).max(50),
      portion: z.string(),
      portionSize: z.number().min(0),
      portionUnit: z.string(),
    });

    const body = await request.json();
    
    // Try to parse as food from database first
    const dbValidation = addFoodFromDbSchema.safeParse(body);
    
    if (dbValidation.success) {
      // Mode 1: Adding food from database
      const { foodId, servings, portion } = dbValidation.data;

      // Verify food exists and user has access
      const food = await prisma.food.findUnique({
        where: { id: foodId },
        select: {
          id: true,
          source: true,
          userId: true,
          name: true,
          calories: true,
          protein: true,
          carbs: true,
          fat: true,
          servingSize: true,
          servingUnit: true,
        },
      });

      if (!food) {
        return NextResponse.json({ error: '找不到此食物' }, { status: 404 });
      }

      // Check permission for USER-created foods
      if (food.source === 'USER' && food.userId !== session.user.id) {
        return NextResponse.json(
          { error: '無權限使用此自訂食物' },
          { status: 403 }
        );
      }

      // Create meal food entry
      const mealFood = await prisma.mealFood.create({
        data: {
          mealId,
          servings,
          portion: portion || `${(food.servingSize || 100) * servings} ${food.servingUnit || 'g'}`,
          portionSize: (food.servingSize || 100) * servings,
          portionUnit: food.servingUnit || 'g',
          // Copy food information
          name: food.name,
          // Store calculated nutrition values
          calories: food.calories * servings,
          protein: food.protein * servings,
          carbs: food.carbs * servings,
          fat: food.fat * servings,
        },
      });

      // Update food search count
      await prisma.food.update({
        where: { id: foodId },
        data: { searchCount: { increment: 1 } },
      });

      // Update or create user favorite food
      await prisma.userFavoriteFood.upsert({
        where: {
          userId_foodId: {
            userId: session.user.id,
            foodId,
          },
        },
        create: {
          userId: session.user.id,
          foodId,
          useCount: 1,
          lastUsed: new Date(),
        },
        update: {
          useCount: { increment: 1 },
          lastUsed: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { mealFood },
      });
    } else {
      // Try to parse as direct nutrition data
      const directValidation = addFoodDirectSchema.safeParse(body);
      
      if (!directValidation.success) {
        return NextResponse.json(
          { error: '資料格式錯誤', issues: directValidation.error.issues },
          { status: 400 }
        );
      }

      // Mode 2: Adding food directly with nutrition data
      const {
        foodName,
        calories,
        protein,
        carbs,
        fat,
        servings,
        portion,
        portionSize,
        portionUnit,
      } = directValidation.data;

      // Create meal food entry directly
      const mealFood = await prisma.mealFood.create({
        data: {
          mealId,
          servings,
          portion,
          portionSize,
          portionUnit,
          name: foodName,
          calories,
          protein,
          carbs,
          fat,
        },
      });

      return NextResponse.json({
        success: true,
        data: { mealFood },
      });
    }
  } catch (error) {
    console.error('Add food to meal error:', error);
    return NextResponse.json(
      { error: '新增食物失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/meals/[id]/foods - Remove food from meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: mealId } = await params;
    const { searchParams } = new URL(request.url);
    const mealFoodId = searchParams.get('mealFoodId');

    if (!mealFoodId) {
      return NextResponse.json(
        { error: '缺少 mealFoodId 參數' },
        { status: 400 }
      );
    }

    // Find meal food and verify ownership
    const mealFood = await prisma.mealFood.findFirst({
      where: {
        id: mealFoodId,
        mealId,
        meal: {
          userId: session.user.id,
        },
      },
    });

    if (!mealFood) {
      return NextResponse.json(
        { error: '找不到此食物或無權限刪除' },
        { status: 404 }
      );
    }

    // Delete meal food
    await prisma.mealFood.delete({
      where: { id: mealFoodId },
    });

    return NextResponse.json({
      success: true,
      message: '已移除食物',
    });
  } catch (error) {
    console.error('Delete meal food error:', error);
    return NextResponse.json(
      { error: '移除食物失敗' },
      { status: 500 }
    );
  }
}
