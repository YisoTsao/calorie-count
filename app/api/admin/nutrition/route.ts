import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';

/**
 * GET /api/admin/nutrition
 * Query params:
 *   userId   - 目標會員 ID（必填）
 *   start    - 開始日期 YYYY-MM-DD（必填）
 *   end      - 結束日期 YYYY-MM-DD（必填）
 *
 * Response: 每日彙總陣列 + 區間總計
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId')?.trim();
  const start = searchParams.get('start')?.trim();
  const end = searchParams.get('end')?.trim();

  if (!userId || !start || !end) {
    return NextResponse.json({ error: '缺少必填參數' }, { status: 400 });
  }

  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T23:59:59.999Z`);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: '日期格式錯誤' }, { status: 400 });
  }

  // 驗證會員存在
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });
  if (!user) return NextResponse.json({ error: '找不到會員' }, { status: 404 });

  // 查詢該區間的所有餐點及食物
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      mealDate: { gte: startDate, lte: endDate },
    },
    include: { foods: true },
    orderBy: { mealDate: 'asc' },
  });

  // 依日期分組彙總
  const byDate = new Map<
    string,
    { calories: number; protein: number; carbs: number; fat: number; fiber: number; meals: number }
  >();

  for (const meal of meals) {
    // 使用 UTC 日期字串作為 key，避免時區問題
    const dateKey = meal.mealDate.toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, meals: 0 });
    }
    const day = byDate.get(dateKey)!;
    day.meals += 1;
    for (const f of meal.foods) {
      day.calories += f.calories * f.servings;
      day.protein += f.protein * f.servings;
      day.carbs += f.carbs * f.servings;
      day.fat += f.fat * f.servings;
      day.fiber += (f.fiber ?? 0) * f.servings;
    }
  }

  // 填滿區間內每一天（無資料的日子補 0）
  const daily: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    meals: number;
  }[] = [];

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const key = cursor.toISOString().slice(0, 10);
    const d = byDate.get(key);
    daily.push({
      date: key,
      calories: +(d?.calories ?? 0).toFixed(1),
      protein: +(d?.protein ?? 0).toFixed(1),
      carbs: +(d?.carbs ?? 0).toFixed(1),
      fat: +(d?.fat ?? 0).toFixed(1),
      fiber: +(d?.fiber ?? 0).toFixed(1),
      meals: d?.meals ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // 區間總計
  const totals = daily.reduce(
    (acc, d) => ({
      calories: +(acc.calories + d.calories).toFixed(1),
      protein: +(acc.protein + d.protein).toFixed(1),
      carbs: +(acc.carbs + d.carbs).toFixed(1),
      fat: +(acc.fat + d.fat).toFixed(1),
      fiber: +(acc.fiber + d.fiber).toFixed(1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const activeDays = daily.filter((d) => d.meals > 0).length;

  return NextResponse.json({
    user,
    daily,
    totals,
    activeDays,
    totalDays: daily.length,
  });
}
