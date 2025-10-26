import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

// 個人資料更新 schema
const updateProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  targetWeight: z.number().positive().optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
});

// 目標更新 schema
const updateGoalsSchema = z.object({
  goalType: z.enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN']).optional(),
  dailyCalorieGoal: z.number().int().positive().optional(),
  proteinGoal: z.number().positive().optional(),
  carbsGoal: z.number().positive().optional(),
  fatGoal: z.number().positive().optional(),
  waterGoal: z.number().int().positive().optional(),
  targetDate: z.string().datetime().optional(),
});

// 偏好設定更新 schema
const updatePreferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'AUTO']).optional(),
  language: z.string().optional(),
  units: z.enum(['METRIC', 'IMPERIAL']).optional(),
  notificationMealReminders: z.boolean().optional(),
  notificationWaterReminders: z.boolean().optional(),
  notificationGoalReminders: z.boolean().optional(),
  notificationSocialUpdates: z.boolean().optional(),
  privacyProfileVisibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
  privacyShowWeight: z.boolean().optional(),
  privacyShowProgress: z.boolean().optional(),
});

/**
 * GET /api/users/me/profile
 * 取得當前使用者完整資料
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授權，請先登入'),
        { status: 401 }
      );
    }

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
        createErrorResponse('NOT_FOUND', '找不到使用者資料'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(user));
  } catch (error) {
    console.error('取得個人資料錯誤:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '取得個人資料失敗'),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me/profile
 * 更新當前使用者個人資料、目標或偏好設定
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授權，請先登入'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { profile, goals, preferences } = body;

    // 驗證輸入
    if (profile) {
      const result = updateProfileSchema.safeParse(profile);
      if (!result.success) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', '個人資料格式不正確', result.error.issues),
          { status: 400 }
        );
      }
    }

    if (goals) {
      const result = updateGoalsSchema.safeParse(goals);
      if (!result.success) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', '目標設定格式不正確', result.error.issues),
          { status: 400 }
        );
      }
    }

    if (preferences) {
      const result = updatePreferencesSchema.safeParse(preferences);
      if (!result.success) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', '偏好設定格式不正確', result.error.issues),
          { status: 400 }
        );
      }
    }

    // 更新個人資料
    if (profile) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...profile,
          ...(profile.dateOfBirth && { dateOfBirth: new Date(profile.dateOfBirth) }),
        },
        update: {
          ...profile,
          ...(profile.dateOfBirth && { dateOfBirth: new Date(profile.dateOfBirth) }),
        },
      });
    }

    // 更新目標
    if (goals) {
      await prisma.userGoals.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...goals,
          ...(goals.targetDate && { targetDate: new Date(goals.targetDate) }),
        },
        update: {
          ...goals,
          ...(goals.targetDate && { targetDate: new Date(goals.targetDate) }),
        },
      });
    }

    // 更新偏好設定
    if (preferences) {
      await prisma.userPreferences.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...preferences,
        },
        update: preferences,
      });
    }

    // 取得更新後的完整資料
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        goals: true,
        preferences: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        user: updatedUser,
        message: '個人資料更新成功',
      })
    );
  } catch (error) {
    console.error('更新個人資料錯誤:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '更新個人資料失敗'),
      { status: 500 }
    );
  }
}
