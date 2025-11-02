import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 查詢使用者成就
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id!;

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    return NextResponse.json({
      achievements,
      count: achievements.length
    });

  } catch (error) {
    console.error('查詢成就失敗:', error);
    return NextResponse.json(
      { error: '查詢成就失敗' },
      { status: 500 }
    );
  }
}
