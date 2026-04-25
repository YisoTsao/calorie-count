import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

/**
 * GET /api/users/me
 * 取得當前使用者資料
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權，請先登入'), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            height: true,
            weight: true,
            dateOfBirth: true,
            gender: true,
            activityLevel: true,
            targetWeight: true,
          },
        },
        goals: {
          select: {
            goalType: true,
            dailyCalorieGoal: true,
            proteinGoal: true,
            carbsGoal: true,
            fatGoal: true,
            waterGoal: true,
            targetDate: true,
          },
        },
        preferences: {
          select: {
            theme: true,
            language: true,
            units: true,
            notificationMealReminders: true,
            notificationWaterReminders: true,
            notificationGoalReminders: true,
            privacyProfileVisibility: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到使用者資料'), {
        status: 404,
      });
    }

    return NextResponse.json(createSuccessResponse(user));
  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '取得使用者資料失敗'), {
      status: 500,
    });
  }
}

/**
 * PATCH /api/users/me
 * 更新當前使用者基本資料
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權，請先登入'), {
        status: 401,
      });
    }

    const body = await req.json();
    const { name, image } = body;

    // 只允許更新 name 和 image
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        user,
        message: '個人資料更新成功',
      })
    );
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新使用者資料失敗'), {
      status: 500,
    });
  }
}
