import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/foods/search
 * 搜尋食物 - 支援關鍵字、分類篩選、分頁
 * 
 * Query Parameters:
 * - q: 搜尋關鍵字 (搜尋名稱)
 * - categoryId: 分類 ID (可選)
 * - page: 頁碼 (預設 1)
 * - limit: 每頁數量 (預設 20, 最大 100)
 * - source: 食物來源篩選 (SYSTEM/USER/API)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // 建立搜尋條件
    const andConditions: Prisma.FoodWhereInput[] = [];
    
    // 關鍵字搜尋
    if (query) {
      andConditions.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    // 分類篩選
    if (categoryId) {
      andConditions.push({ categoryId });
    }

    // 來源篩選
    if (source && ['SYSTEM', 'USER', 'API'].includes(source)) {
      if (source === 'USER') {
        // 自訂食物: 只顯示使用者自己的食物
        andConditions.push({
          AND: [
            { source: 'USER' },
            { userId: session.user.id },
          ],
        });
      } else {
        // 系統食物或 API 食物: 直接篩選來源
        andConditions.push({ source: source as 'SYSTEM' | 'USER' | 'API' });
      }
    } else {
      // 預設顯示系統食物和使用者自己的食物
      andConditions.push({
        OR: [
          { source: 'SYSTEM' },
          { source: 'USER', userId: session.user.id },
        ],
      });
    }

    const where: Prisma.FoodWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // 執行搜尋
    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
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
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy: [
          { searchCount: 'desc' }, // 優先顯示熱門食物
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.food.count({ where }),
    ]);

    // 查詢使用者的收藏清單
    const userFavorites = await prisma.userFavoriteFood.findMany({
      where: {
        userId: session.user.id,
        foodId: { in: foods.map(f => f.id) },
      },
      select: {
        foodId: true,
      },
    });

    const favoriteIds = new Set(userFavorites.map(f => f.foodId));

    // 加入 isFavorite 資訊
    const foodsWithFavorite = foods.map(food => ({
      ...food,
      isFavorite: favoriteIds.has(food.id),
    }));

    // 更新搜尋計數 (非同步,不等待)
    if (query && foods.length > 0) {
      prisma.food.updateMany({
        where: {
          id: { in: foods.map(f => f.id) },
        },
        data: {
          searchCount: { increment: 1 },
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      foods: foodsWithFavorite,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('搜尋食物失敗:', error);
    return NextResponse.json(
      { error: '搜尋失敗' },
      { status: 500 }
    );
  }
}
