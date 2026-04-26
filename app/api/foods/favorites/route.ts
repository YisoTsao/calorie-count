import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/foods/favorites
 * 取得使用者的常用食物
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const favorites = await prisma.userFavoriteFood.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        food: {
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
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: [{ useCount: 'desc' }, { lastUsed: 'desc' }],
    });

    return NextResponse.json({
      favorites: favorites.map((f) => ({
        ...f.food,
        favoriteInfo: {
          useCount: f.useCount,
          lastUsed: f.lastUsed,
        },
      })),
    });
  } catch (error) {
    console.error('取得常用食物失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

/**
 * POST /api/foods/favorites
 * 切換食物的收藏狀態 (新增或移除)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { foodId, isFavorite } = await request.json();

    if (!foodId) {
      return NextResponse.json({ error: '缺少 foodId' }, { status: 400 });
    }

    // 檢查食物是否存在
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      return NextResponse.json({ error: '食物不存在' }, { status: 404 });
    }

    // 如果 isFavorite 為 false,則移除收藏
    if (isFavorite === false) {
      await prisma.userFavoriteFood
        .delete({
          where: {
            userId_foodId: {
              userId: session.user.id,
              foodId,
            },
          },
        })
        .catch(() => {
          // 如果記錄不存在,忽略錯誤
        });

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: '已移除收藏',
      });
    }

    // 如果 isFavorite 為 true 或未指定,則新增/更新收藏
    const favorite = await prisma.userFavoriteFood.upsert({
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
        lastUsed: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        isFavorite: true,
        favorite,
        message: '已加入收藏',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('切換收藏狀態失敗:', error);
    return NextResponse.json({ error: '操作失敗' }, { status: 500 });
  }
}
