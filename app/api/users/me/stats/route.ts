import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  getBMICategory,
  calculateDailyCalorieGoal,
  calculateMacronutrients,
  calculateIdealWeightRange,
  ActivityLevel as HealthActivityLevel,
  GoalType as HealthGoalType,
  Gender as HealthGender,
} from '@/lib/calculations/health';

// Prisma ActivityLevel → health.ts ActivityLevel
const ACTIVITY_LEVEL_MAP: Record<string, HealthActivityLevel> = {
  SEDENTARY: 'SEDENTARY',
  LIGHT: 'LIGHTLY_ACTIVE',
  MODERATE: 'MODERATELY_ACTIVE',
  ACTIVE: 'VERY_ACTIVE',
  VERY_ACTIVE: 'EXTREMELY_ACTIVE',
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權'), { status: 401 });
    }

    // 取得使用者完整資料
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        goals: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '使用者不存在'),
        { status: 404 }
      );
    }

    const profile = user.profile;
    const goals = user.goals;

    // 基本統計
    const stats: any = {
      hasProfile: !!profile,
      hasGoals: !!goals,
      profileCompleteness: 0,
    };

    // 如果有身高體重資料,計算健康指標
    if (profile?.height && profile?.weight) {
      const bmi = calculateBMI(profile.weight, profile.height);
      const bmiCategory = getBMICategory(bmi);
      const idealWeight = calculateIdealWeightRange(profile.height);

      stats.bmi = bmi;
      stats.bmiCategory = bmiCategory;
      stats.idealWeightRange = idealWeight;

      // 如果有足夠資料,計算代謝率
      if (profile.dateOfBirth && profile.gender && profile.activityLevel) {
        const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
        const healthActivityLevel = ACTIVITY_LEVEL_MAP[profile.activityLevel];
        const bmr = calculateBMR(profile.weight, profile.height, age, profile.gender as HealthGender);
        const tdee = calculateTDEE(bmr, healthActivityLevel);

        stats.bmr = bmr;
        stats.tdee = tdee;

        // 如果有目標,計算建議攝取量
        if (goals?.goalType) {
          const dailyCalories = calculateDailyCalorieGoal(
            tdee,
            goals.goalType as HealthGoalType,
            0
          );

          const macros = calculateMacronutrients(
            dailyCalories,
            goals.goalType as HealthGoalType,
            profile.weight
          );

          stats.recommendedCalories = dailyCalories;
          stats.recommendedMacros = macros;
        }
      }

      // 計算個人資料完整度
      const profileFields = [
        'height',
        'weight',
        'dateOfBirth',
        'gender',
        'activityLevel',
      ];
      const completedFields = profileFields.filter(
        (field) => profile[field as keyof typeof profile] !== null
      );
      stats.profileCompleteness = Math.round(
        (completedFields.length / profileFields.length) * 100
      );
    }

    // 目標進度 (需要從其他表取得實際數據,這裡先模擬)
    stats.currentStreak = 0; // 連續打卡天數
    stats.totalDays = 0; // 總使用天數

    return NextResponse.json(createSuccessResponse(stats));
  } catch (error) {
    console.error('統計資料錯誤:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '取得統計資料失敗'),
      { status: 500 }
    );
  }
}
