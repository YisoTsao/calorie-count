import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAchievements, getAchievementsWithProgress } from '@/lib/achievements/checker';

// GET /api/achievements - 查詢並計算成就進度
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id;

    // 先執行 checker（冪等，安全重複呼叫）
    await checkAchievements(userId);

    // 取得帶進度的完整成就列表
    const data = await getAchievementsWithProgress(userId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('查詢成就失敗:', error);
    return NextResponse.json({ error: '查詢成就失敗' }, { status: 500 });
  }
}
