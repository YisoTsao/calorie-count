import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * 批量計算多天的統計資料
 * POST /api/stats/batch?days=30
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 計算過去 N 天的統計
    const results = [];
    const today = new Date();
    // 使用 UTC 日期避免時區問題
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      const dateString = date.toISOString().split('T')[0];

      try {
        // 呼叫 POST /api/stats 來計算該天的統計
        const response = await fetch(`${request.nextUrl.origin}/api/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ date: dateString }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ date: dateString, success: true, data });
        } else {
          results.push({ date: dateString, success: false, error: await response.text() });
        }
      } catch (error) {
        console.error(`Failed to calculate stats for ${dateString}:`, error);
        results.push({ date: dateString, success: false, error: String(error) });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `已計算 ${successCount}/${days} 天的統計資料`,
      results,
    });
  } catch (error) {
    console.error('Batch stats calculation error:', error);
    return NextResponse.json({ error: '批量計算統計失敗' }, { status: 500 });
  }
}
