import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { AchievementType } from '@prisma/client';

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

    meals.forEach(meal => {
      meal.foods.forEach(mealFood => {
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

    const totalWater = waterRecords.reduce((sum, record) => sum + record.amount, 0);

    // 3. 查詢當日運動記錄
    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
        date: statsDate
      }
    });

    const totalExercise = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalExerciseCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);

    // 4. 查詢當日體重
    const weightRecord = await prisma.weightRecord.findFirst({
      where: {
        userId,
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
        userId_date: {
          userId,
          date: statsDate,
        }
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

    // 8. 檢查成就
    await checkAndAwardAchievements(userId);

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

// 查詢統計資料
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate'); // YYYY-MM-DD
    const days = parseInt(searchParams.get('days') || '7'); // 預設 7 天

    const userId = session.user.id!;

    interface WhereClause {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const whereClause: WhereClause = { userId };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    } else {
      // 查詢最近 N 天 - 使用 UTC 日期
      const today = new Date();
      today.setUTCHours(23, 59, 59, 999);
      
      const pastDate = new Date();
      pastDate.setUTCDate(pastDate.getUTCDate() - (days - 1));
      pastDate.setUTCHours(0, 0, 0, 0);
      
      whereClause.date = {
        gte: pastDate,
        lte: today
      };
    }

    const stats = await prisma.dailyStats.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    });

    // 計算總結
    const summary = {
      totalDays: stats.length,
      avgCalories: stats.reduce((sum, s) => sum + s.totalCalories, 0) / (stats.length || 1),
      avgProtein: stats.reduce((sum, s) => sum + s.totalProtein, 0) / (stats.length || 1),
      avgCarbs: stats.reduce((sum, s) => sum + s.totalCarbs, 0) / (stats.length || 1),
      avgFat: stats.reduce((sum, s) => sum + s.totalFat, 0) / (stats.length || 1),
      avgWater: stats.reduce((sum, s) => sum + s.totalWater, 0) / (stats.length || 1),
      avgExercise: stats.reduce((sum, s) => sum + s.totalExercise, 0) / (stats.length || 1),
      avgExerciseCalories: stats.reduce((sum, s) => sum + s.totalExerciseCalories, 0) / (stats.length || 1),
      goalsMetDays: stats.filter(s => s.allGoalsMet).length,
      calorieGoalMetDays: stats.filter(s => s.calorieGoalMet).length,
      waterGoalMetDays: stats.filter(s => s.waterGoalMet).length,
      exerciseGoalMetDays: stats.filter(s => s.exerciseGoalMet).length,
      streak: calculateCurrentStreak(stats)
    };

    return NextResponse.json({
      stats,
      summary
    });

  } catch (error) {
    console.error('查詢統計失敗:', error);
    return NextResponse.json(
      { error: '查詢統計失敗' },
      { status: 500 }
    );
  }
}

// 計算連續打卡天數
function calculateCurrentStreak(stats: Array<{ date: Date; mealCount: number }>): number {
  if (stats.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 從今天往前算
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const found = stats.find(s => {
      const statDate = new Date(s.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === checkDate.getTime();
    });

    if (found && found.mealCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// 檢查並授予成就
async function checkAndAwardAchievements(userId: string) {
  const stats = await prisma.dailyStats.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });

  const existingAchievements = await prisma.achievement.findMany({
    where: { userId }
  });

  const existingTypes = new Set(existingAchievements.map(a => a.type));
  
  interface NewAchievement {
    userId: string;
    type: AchievementType;
    title: string;
    description: string;
    icon: string;
  }
  
  const newAchievements: NewAchievement[] = [];

  // 計算連續打卡
  const streak = calculateCurrentStreak(stats);

  // 連續 7 天
  if (streak >= 7 && !existingTypes.has('STREAK_7')) {
    newAchievements.push({
      userId,
      type: 'STREAK_7',
      title: '新手上路',
      description: '連續記錄 7 天飲食',
      icon: '🔥'
    });
  }

  // 連續 30 天
  if (streak >= 30 && !existingTypes.has('STREAK_30')) {
    newAchievements.push({
      userId,
      type: 'STREAK_30',
      title: '習慣養成',
      description: '連續記錄 30 天飲食',
      icon: '💪'
    });
  }

  // 連續 100 天
  if (streak >= 100 && !existingTypes.has('STREAK_100')) {
    newAchievements.push({
      userId,
      type: 'STREAK_100',
      title: '毅力大師',
      description: '連續記錄 100 天飲食',
      icon: '🏆'
    });
  }

  // 第一餐
  if (stats.length === 1 && !existingTypes.has('FIRST_MEAL')) {
    newAchievements.push({
      userId,
      type: 'FIRST_MEAL',
      title: '起步',
      description: '記錄了第一餐飲食',
      icon: '🍽️'
    });
  }

  // 完成第一週
  if (stats.length >= 7 && !existingTypes.has('FIRST_WEEK')) {
    newAchievements.push({
      userId,
      type: 'FIRST_WEEK',
      title: '一週達成',
      description: '堅持記錄一週',
      icon: '📅'
    });
  }

  // 一週達成卡路里目標
  const lastWeekGoalMet = stats.slice(0, 7).filter(s => s.calorieGoalMet).length;
  if (lastWeekGoalMet >= 7 && !existingTypes.has('CALORIE_GOAL_WEEK')) {
    newAchievements.push({
      userId,
      type: 'CALORIE_GOAL_WEEK',
      title: '卡路里達人',
      description: '連續一週達成卡路里目標',
      icon: '🎯'
    });
  }

  // 飲水冠軍
  const lastWeekWaterGoalMet = stats.slice(0, 7).filter(s => s.waterGoalMet).length;
  if (lastWeekWaterGoalMet >= 7 && !existingTypes.has('WATER_CHAMPION')) {
    newAchievements.push({
      userId,
      type: 'WATER_CHAMPION',
      title: '補水達人',
      description: '連續一週達成飲水目標',
      icon: '💧'
    });
  }

  // 運動戰士
  const lastWeekExerciseGoalMet = stats.slice(0, 7).filter(s => s.exerciseGoalMet).length;
  if (lastWeekExerciseGoalMet >= 7 && !existingTypes.has('EXERCISE_WARRIOR')) {
    newAchievements.push({
      userId,
      type: 'EXERCISE_WARRIOR',
      title: '運動健將',
      description: '連續一週堅持運動',
      icon: '🏃'
    });
  }

  // 批次建立新成就
  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({
      data: newAchievements
    });
  }

  return newAchievements;
}
