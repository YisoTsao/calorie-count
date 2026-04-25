import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/foods/categories
 * 取得所有食物分類
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const categories = await prisma.foodCategory.findMany({
      include: {
        _count: {
          select: {
            foods: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('取得食物分類失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}
