import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 驗證 schema
const createFoodSchema = z.object({
  name: z.string().min(1, '食物名稱不能為空').max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  servingSize: z.number().min(0).optional(),
  servingUnit: z.string().max(20).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
});

/**
 * POST /api/foods
 * 建立使用者自訂食物
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();

    // 驗證資料
    const validationResult = createFoodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '資料驗證失敗',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 檢查分類是否存在
    if (data.categoryId) {
      const category = await prisma.foodCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return NextResponse.json({ error: '指定的分類不存在' }, { status: 400 });
      }
    }

    // 建立食物
    const food = await prisma.food.create({
      data: {
        ...data,
        source: 'USER',
        userId: session.user.id,
        isVerified: false,
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
            nameEn: true,
          },
        },
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error('建立食物失敗:', error);
    return NextResponse.json({ error: '建立失敗' }, { status: 500 });
  }
}

/**
 * GET /api/foods
 * 取得使用者自訂的食物列表
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const foods = await prisma.food.findMany({
      where: {
        source: 'USER',
        userId: session.user.id,
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
            nameEn: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ foods });
  } catch (error) {
    console.error('取得自訂食物失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}
