import { prisma } from '@/lib/prisma';

type TriggerType = 'FIRST_MEAL' | 'STREAK_DAYS' | 'TOTAL_MEALS' | 'TOTAL_DAYS' | 'GOAL_HIT_COUNT';

export interface CheckResult {
  newlyEarned: Array<{ code: string; name: string; icon: string }>;
  totalEarned: number;
}

/**
 * 計算使用者的成就進度並授予新成就
 * 設計為冪等 - 可安全重複呼叫
 */
export async function checkAchievements(userId: string): Promise<CheckResult> {
  const [definitions, userStats, goalHitDays] = await Promise.all([
    prisma.achievementDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    getUserStats(userId),
    getGoalHitCount(userId),
  ]);

  const newlyEarned: Array<{ code: string; name: string; icon: string }> = [];

  for (const def of definitions) {
    const met = isConditionMet(def.triggerType, def.triggerValue, { ...userStats, goalHitDays });
    if (!met) continue;

    // upsert 保證冪等，已獲得的不會重複寫入
    const result = await prisma.userAchievement.upsert({
      where: { userId_definitionId: { userId, definitionId: def.id } },
      update: {},
      create: {
        userId,
        definitionId: def.id,
        progressSnapshot: { ...userStats, goalHitDays },
      },
    });

    // 判斷是否為這次才達成（剛建立 vs 舊有）
    const justEarned = Math.abs(result.earnedAt.getTime() - Date.now()) < 3000;
    if (justEarned) {
      newlyEarned.push({ code: def.code, name: def.name, icon: def.icon });
    }
  }

  const totalEarned = await prisma.userAchievement.count({ where: { userId } });
  return { newlyEarned, totalEarned };
}

function isConditionMet(
  triggerType: TriggerType,
  triggerValue: number | null,
  stats: ReturnType<typeof getUserStats> extends Promise<infer T>
    ? T & { goalHitDays: number }
    : never
): boolean {
  switch (triggerType) {
    case 'FIRST_MEAL':
      return stats.totalMeals >= 1;
    case 'STREAK_DAYS':
      return stats.currentStreak >= (triggerValue ?? 0);
    case 'TOTAL_MEALS':
      return stats.totalMeals >= (triggerValue ?? 0);
    case 'TOTAL_DAYS':
      return stats.appDays >= (triggerValue ?? 0);
    case 'GOAL_HIT_COUNT':
      return stats.goalHitDays >= (triggerValue ?? 0);
    default:
      return false;
  }
}

/**
 * 取得使用者統計數字（用於成就計算）
 */
async function getUserStats(userId: string) {
  const [user, totalMeals, mealDates] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.meal.count({ where: { userId } }),
    // 取得所有有記錄飲食的日期（UTC 日期字串）
    prisma.meal.findMany({
      where: { userId },
      select: { mealDate: true },
      distinct: ['mealDate'],
      orderBy: { mealDate: 'asc' },
    }),
  ]);

  // App 使用天數（從註冊至今）
  const appDays = user
    ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  // 取得有記錄的唯一日期集合
  const uniqueDates = Array.from(
    new Set(mealDates.map((m: { mealDate: Date }) => m.mealDate.toISOString().split('T')[0]))
  ).sort() as string[];

  // 計算目前連續記錄天數
  const currentStreak = calculateStreak(uniqueDates);

  return { totalMeals, appDays, currentStreak, uniqueDates };
}

/**
 * 計算連續記錄天數（從今天往回推）
 */
function calculateStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const dateSet = new Set(sortedDates);
  let streak = 0;
  const current = new Date(today);

  // 如果今天有記錄，從今天開始；否則從昨天開始
  if (!dateSet.has(todayStr)) {
    current.setDate(current.getDate() - 1);
  }

  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    if (!dateSet.has(dateStr)) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

/**
 * 計算達成熱量目標的天數
 */
async function getGoalHitCount(userId: string): Promise<number> {
  // 取得使用者的熱量目標
  const goals = await prisma.userGoals.findUnique({
    where: { userId },
    select: { dailyCalorieGoal: true },
  });

  if (!goals?.dailyCalorieGoal) return 0;

  const calorieGoal = goals.dailyCalorieGoal;

  // 查詢所有餐食日期的熱量
  const mealsByDate = await prisma.meal.findMany({
    where: { userId },
    include: { foods: { select: { calories: true } } },
    orderBy: { mealDate: 'asc' },
  });

  // 依日期分組計算總卡路里
  const dailyCalories = new Map<string, number>();
  for (const meal of mealsByDate) {
    const dateStr = meal.mealDate.toISOString().split('T')[0];
    const mealCalories = meal.foods.reduce(
      (sum: number, f: { calories: number }) => sum + f.calories,
      0
    );
    dailyCalories.set(dateStr, (dailyCalories.get(dateStr) ?? 0) + mealCalories);
  }

  // 計算達到 90%~110% 目標的天數（合理達標範圍）
  let hitCount = 0;
  for (const calories of dailyCalories.values()) {
    const pct = calories / calorieGoal;
    if (pct >= 0.9 && pct <= 1.1) hitCount++;
  }

  return hitCount;
}

/**
 * 取得成就詳細資訊（含定義 + 使用者進度）
 */
export async function getAchievementsWithProgress(userId: string) {
  const [definitions, earned, userStats, goalHitDays] = await Promise.all([
    prisma.achievementDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { definition: true },
    }),
    getUserStats(userId),
    getGoalHitCount(userId),
  ]);

  type EarnedItem = (typeof earned)[number];
  const earnedMap = new Map(earned.map((e: EarnedItem) => [e.definitionId, e]));

  const result = definitions.map((def: (typeof definitions)[number]) => {
    const userAchievement = earnedMap.get(def.id);
    const progress = getProgressValue(def.triggerType, def.triggerValue, {
      ...userStats,
      goalHitDays,
    });

    return {
      id: def.id,
      code: def.code,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      triggerType: def.triggerType,
      triggerValue: def.triggerValue,
      earned: !!userAchievement,
      earnedAt: (userAchievement as EarnedItem | undefined)?.earnedAt ?? null,
      progress: progress.current,
      maxProgress: progress.max,
    };
  });

  return {
    achievements: result,
    stats: { ...userStats, goalHitDays },
    earnedCount: earned.length,
    totalCount: definitions.length,
  };
}

function getProgressValue(
  triggerType: TriggerType,
  triggerValue: number | null,
  stats: { totalMeals: number; appDays: number; currentStreak: number; goalHitDays: number }
): { current: number; max: number } {
  const max = triggerValue ?? 1;
  switch (triggerType) {
    case 'FIRST_MEAL':
      return { current: Math.min(stats.totalMeals, 1), max: 1 };
    case 'STREAK_DAYS':
      return { current: Math.min(stats.currentStreak, max), max };
    case 'TOTAL_MEALS':
      return { current: Math.min(stats.totalMeals, max), max };
    case 'TOTAL_DAYS':
      return { current: Math.min(stats.appDays, max), max };
    case 'GOAL_HIT_COUNT':
      return { current: Math.min(stats.goalHitDays, max), max };
    default:
      return { current: 0, max: 1 };
  }
}
