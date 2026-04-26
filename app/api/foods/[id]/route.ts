import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/foods/[id]
 * 取得單一食物詳細資訊
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;

    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameJa: true,
            icon: true,
            description: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            country: true,
            logo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!food) {
      return NextResponse.json({ error: '找不到該食物' }, { status: 404 });
    }

    // 檢查權限 - USER 類型的食物只有創建者可以查看
    if (food.source === 'USER' && food.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限查看' }, { status: 403 });
    }

    // 檢查是否在使用者的常用清單中
    const isFavorite = await prisma.userFavoriteFood.findUnique({
      where: {
        userId_foodId: {
          userId: session.user.id,
          foodId: food.id,
        },
      },
    });

    return NextResponse.json({
      ...food,
      isFavorite: !!isFavorite,
    });
  } catch (error) {
    console.error('取得食物詳情失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

/**
 * PUT /api/foods/[id]
 * 更新食物資訊 (僅限自訂食物)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;

    // 檢查食物是否存在
    const existingFood = await prisma.food.findUnique({
      where: { id },
    });

    if (!existingFood) {
      return NextResponse.json({ error: '找不到該食物' }, { status: 404 });
    }

    // 只允許更新自己創建的食物
    if (existingFood.source !== 'USER' || existingFood.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限更新此食物' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      servingSize,
      servingUnit,
      categoryId,
    } = body;

    // 驗證必填欄位
    if (!name || !categoryId || !servingSize || !servingUnit) {
      return NextResponse.json({ error: '請填寫所有必填欄位' }, { status: 400 });
    }

    // 更新食物
    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        name,
        nameEn: nameEn || null,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: fiber ? parseFloat(fiber) : null,
        servingSize: parseFloat(servingSize),
        servingUnit,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameJa: true,
            icon: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.error('更新食物失敗:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE /api/foods/[id]
 * 刪除食物 (僅限自訂食物)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;

    // 檢查食物是否存在
    const existingFood = await prisma.food.findUnique({
      where: { id },
    });

    if (!existingFood) {
      return NextResponse.json({ error: '找不到該食物' }, { status: 404 });
    }

    // 只允許刪除自己創建的食物
    if (existingFood.source !== 'USER' || existingFood.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限刪除此食物' }, { status: 403 });
    }

    // 刪除食物 (會自動級聯刪除相關的 favorites 和 meal items)
    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除食物失敗:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
