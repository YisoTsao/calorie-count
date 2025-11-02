import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/foods/favorites/[id]
 * 從常用列表移除食物
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 檢查是否為使用者的常用食物
    const favorite = await prisma.userFavoriteFood.findFirst({
      where: {
        foodId: params.id,
        userId: session.user.id,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: '找不到該常用食物' },
        { status: 404 }
      );
    }

    // 刪除常用食物
    await prisma.userFavoriteFood.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('移除常用食物失敗:', error);
    return NextResponse.json(
      { error: '移除失敗' },
      { status: 500 }
    );
  }
}
