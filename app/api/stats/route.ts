import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 計算每日統計
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { date } = z.object({
      date: z.string() // YYYY-MM-DD
    }).parse(body);

    const userId = session.user.id!;
    // 使用 UTC 日期避免時區問題
    const statsDate = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // 1. 查詢當日飲食記錄
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        mealDate: {
          gte: statsDate,
          lte: endOfDay
        }
      },
      include: {
        foods: true
      }
    });

    // 計算總營養素
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach((meal: { foods: Array<{ calories: number; protein: number; carbs: number; fat: number }> }) => {
      meal.foods.forEach((mealFood: { calories: number; protein: number; carbs: number; fat: number }) => {
        // 資料庫中的營養值已經是乘過 servings 的總值,不需要再乘
        totalCalories += mealFood.calories;
        totalProtein += mealFood.protein;
        totalCarbs += mealFood.carbs;
        totalFat += mealFood.fat;
      });
    });

    // 2. 查詢當日飲水記錄
    const waterRecords = await prisma.waterIntake.findMany({
      where: {
        userId,
        date: statsDate
      }
    });

    const totalWater = waterRecords.reduce((sum: number, record: { amount: number }) => sum + record.amount, 0);

    // 3. 查詢當日運動記錄
    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
        date: statsDate
      }
    });

    const totalExercise = exercises.reduce((sum: number, ex: { duration: number; calories: number }) => sum + ex.duration, 0);
    const totalExerciseCalories = exercises.reduce((sum: number, ex: { duration: number; calories: number }) => sum + ex.calories, 0);

    // 4. 查詢當日體重
    const weightRecord = await prisma.weightRecord.findUnique({
      where: {
        date: statsDate
      }
    });

    // 5. 查詢使用者目標
    const goals = await prisma.userGoals.findUnique({
      where: { userId }
    });

    // 6. 判斷目標達成
    const calorieGoalMet = goals ? Math.abs(totalCalories - goals.dailyCalorieGoal) <= goals.dailyCalorieGoal * 0.1 : false;
    const proteinGoalMet = goals ? totalProtein >= goals.proteinGoal : false;
    const waterGoalMet = goals ? totalWater >= goals.waterGoal : false;
    const exerciseGoalMet = totalExercise >= 30; // 至少 30 分鐘運動
    const allGoalsMet = calorieGoalMet && proteinGoalMet && waterGoalMet && exerciseGoalMet;

    // 7. Upsert 每日統計
    const stats = await prisma.dailyStats.upsert({
      where: {
        userId_date: { userId, date: statsDate }
      },
      create: {
        userId,
        date: statsDate,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealCount: meals.length,
        totalWater,
        waterCount: waterRecords.length,
        totalExercise,
        totalExerciseCalories,
        exerciseCount: exercises.length,
        weight: weightRecord?.weight,
        bmi: weightRecord?.bmi,
        calorieGoalMet,
        proteinGoalMet,
        waterGoalMet,
        exerciseGoalMet,
        allGoalsMet
      },
      update: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealCount: meals.length,
        totalWater,
        waterCount: waterRecords.length,
        totalExercise,
        totalExerciseCalories,
        exerciseCount: exercises.length,
        weight: weightRecord?.weight,
        bmi: weightRecord?.bmi,
        calorieGoalMet,
        proteinGoalMet,
        waterGoalMet,
        exerciseGoalMet,
        allGoalsMet
      }
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('計算每日統計失敗:', error);
    return NextResponse.json(
      { error: '計算每日統計失敗' },
      { status: 500 }
    );
  }
}

// 查詢統計資料（直接從原始資料計算，不依賴快取的 DailyStats）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate'); // YYYY-MM-DD
    const endDateParam = searchParams.get('endDate');     // YYYY-MM-DD
    const days = parseInt(searchParams.get('days') || '7');

    const userId = session.user.id;

    // 決定日期範圍（UTC）
    let startDateStr: string;
    let endDateStr: string;

    if (startDateParam && endDateParam) {
      startDateStr = startDateParam;
      endDateStr   = endDateParam;
    } else {
      const today = new Date();
      endDateStr   = today.toISOString().split('T')[0];
      const start  = new Date(today);
      start.setUTCDate(start.getUTCDate() - (days - 1));
      startDateStr = start.toISOString().split('T')[0];
    }

    const startDT = new Date(startDateStr + 'T00:00:00.000Z');
    const endDT   = new Date(endDateStr   + 'T23:59:59.999Z');

    // 並行查詢所有原始資料
    const [meals, waterIntakes, exercises, weightRecords, goals] = await Promise.all([
      prisma.meal.findMany({
        where: { userId, mealDate: { gte: startDT, lte: endDT } },
        include: { foods: true },
      }),
      prisma.waterIntake.findMany({
        where: {
          userId,
          date: {
            gte: new Date(startDateStr + 'T00:00:00.000Z'),
            lte: new Date(endDateStr   + 'T00:00:00.000Z'),
          },
        },
      }),
      prisma.exercise.findMany({
        where: {
          userId,
          date: {
            gte: new Date(startDateStr + 'T00:00:00.000Z'),
            lte: new Date(endDateStr   + 'T00:00:00.000Z'),
          },
        },
      }),
      prisma.weightRecord.findMany({
        where: {
          userId,
          date: {
            gte: new Date(startDateStr + 'T00:00:00.000Z'),
            lte: new Date(endDateStr   + 'T00:00:00.000Z'),
          },
        },
      }),
      prisma.userGoals.findUnique({ where: { userId } }),
    ]);

    // 每日資料型別
    type DayData = {
      date: string;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      mealCount: number;
      totalWater: number;
      totalExercise: number;
      totalExerciseCalories: number;
      weight: number | null;
      calorieGoalMet: boolean;
      waterGoalMet: boolean;
      exerciseGoalMet: boolean;
      allGoalsMet: boolean;
    };

    // 產生日期範圍內每天的空白記錄
    const dateMap = new Map<string, DayData>();
    const cur = new Date(startDateStr + 'T00:00:00.000Z');
    const endCur = new Date(endDateStr + 'T00:00:00.000Z');
    while (cur <= endCur) {
      const ds = cur.toISOString().split('T')[0];
      dateMap.set(ds, {
        date: ds,
        totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
        mealCount: 0, totalWater: 0, totalExercise: 0, totalExerciseCalories: 0,
        weight: null, calorieGoalMet: false, waterGoalMet: false,
        exerciseGoalMet: false, allGoalsMet: false,
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // 聚合飲食（MealFood.calories 已是該食物項目的總卡路里，不需再乘 servings）
    for (const meal of meals) {
      const ds = meal.mealDate.toISOString().split('T')[0];
      const day = dateMap.get(ds);
      if (!day) continue;
      day.mealCount++;
      for (const food of meal.foods) {
        day.totalCalories += food.calories;
        day.totalProtein  += food.protein;
        day.totalCarbs    += food.carbs;
        day.totalFat      += food.fat;
      }
    }

    // 聚合飲水
    for (const w of waterIntakes) {
      const ds = w.date.toISOString().split('T')[0];
      const day = dateMap.get(ds);
      if (day) day.totalWater += w.amount;
    }

    // 聚合運動
    for (const ex of exercises) {
      const ds = ex.date.toISOString().split('T')[0];
      const day = dateMap.get(ds);
      if (day) {
        day.totalExercise         += ex.duration;
        day.totalExerciseCalories += ex.calories;
      }
    }

    // 體重
    for (const wr of weightRecords) {
      const ds = wr.date.toISOString().split('T')[0];
      const day = dateMap.get(ds);
      if (day) day.weight = wr.weight;
    }

    // 目標達成判斷
    if (goals) {
      for (const day of dateMap.values()) {
        if (day.totalCalories > 0) {
          day.calorieGoalMet =
            Math.abs(day.totalCalories - goals.dailyCalorieGoal) <=
            goals.dailyCalorieGoal * 0.1;
        }
        day.waterGoalMet    = day.totalWater    >= goals.waterGoal;
        day.exerciseGoalMet = day.totalExercise >= 30;
        day.allGoalsMet     = day.calorieGoalMet && day.waterGoalMet && day.exerciseGoalMet;
      }
    }

    const stats = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 僅用有活動的天數計算平均值
    const activeDays = stats.filter(
      s => s.mealCount > 0 || s.totalWater > 0 || s.totalExercise > 0
    );
    const n = activeDays.length || 1;

    const summary = {
      totalDays:            activeDays.length,
      avgCalories:          activeDays.reduce((s, d) => s + d.totalCalories, 0) / n,
      avgProtein:           activeDays.reduce((s, d) => s + d.totalProtein,  0) / n,
      avgCarbs:             activeDays.reduce((s, d) => s + d.totalCarbs,    0) / n,
      avgFat:               activeDays.reduce((s, d) => s + d.totalFat,      0) / n,
      avgWater:             activeDays.reduce((s, d) => s + d.totalWater,    0) / n,
      avgExercise:          activeDays.reduce((s, d) => s + d.totalExercise, 0) / n,
      avgExerciseCalories:  activeDays.reduce((s, d) => s + d.totalExerciseCalories, 0) / n,
      goalsMetDays:         stats.filter(s => s.allGoalsMet).length,
      calorieGoalMetDays:   stats.filter(s => s.calorieGoalMet).length,
      waterGoalMetDays:     stats.filter(s => s.waterGoalMet).length,
      exerciseGoalMetDays:  stats.filter(s => s.exerciseGoalMet).length,
      streak:               calculateCurrentStreak(stats),
    };

    return NextResponse.json({ stats, summary });

  } catch (error) {
    console.error('查詢統計失敗:', error);
    return NextResponse.json({ error: '查詢統計失敗' }, { status: 500 });
  }
}

// 計算連續打卡天數
function calculateCurrentStreak(stats: Array<{ date: string; mealCount: number }>): number {
  if (stats.length === 0) return 0;

  const dateSet = new Set(
    stats.filter(s => s.mealCount > 0).map(s => s.date)
  );

  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dateSet.has(ds)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

