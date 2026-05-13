import { prisma } from '@/lib/prisma';
import { getTaipeiToday } from '@/lib/date';

export interface NutritionGap {
  caloriesRemaining: number;
  proteinRemaining: number;
  carbsRemaining: number;
  fatRemaining: number;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * 計算今日營養缺口：目標 - 已攝取
 */
export async function calculateNutritionGap(userId: string): Promise<NutritionGap> {
  const today = getTaipeiToday();

  const [goals, stats] = await Promise.all([
    prisma.userGoals.findUnique({ where: { userId } }),
    prisma.dailyStats.findFirst({
      where: { userId, date: new Date(today) },
    }),
  ]);

  const goalValues = {
    calories: goals?.dailyCalorieGoal ?? 2000,
    protein: goals?.proteinGoal ?? 50,
    carbs: goals?.carbsGoal ?? 250,
    fat: goals?.fatGoal ?? 65,
  };

  const consumed = {
    calories: stats?.totalCalories ?? 0,
    protein: stats?.totalProtein ?? 0,
    carbs: stats?.totalCarbs ?? 0,
    fat: stats?.totalFat ?? 0,
  };

  return {
    caloriesRemaining: Math.max(0, goalValues.calories - consumed.calories),
    proteinRemaining: Math.max(0, goalValues.protein - consumed.protein),
    carbsRemaining: Math.max(0, goalValues.carbs - consumed.carbs),
    fatRemaining: Math.max(0, goalValues.fat - consumed.fat),
    consumed,
    goals: goalValues,
  };
}
