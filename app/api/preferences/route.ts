import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/preferences - 取得使用者偏好設定
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    });

    // 如果沒有偏好設定，建立預設值
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          theme: 'LIGHT',
          language: 'zh-TW',
          units: 'METRIC',
          notificationMealReminders: true,
          notificationWaterReminders: true,
          notificationGoalReminders: true,
          notificationSocialUpdates: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}

// PUT /api/preferences - 更新使用者偏好設定
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const updatePreferencesSchema = z.object({
      theme: z.enum(['LIGHT', 'DARK', 'AUTO']).optional(),
      language: z.string().optional(),
      units: z.enum(['METRIC', 'IMPERIAL']).optional(),
      // 支援舊版 notifications 物件，也支援直接傳新版欄位
      notifications: z.object({
        mealReminder: z.boolean().optional(),
        achievementNotif: z.boolean().optional(),
      }).optional(),
      notificationMealReminders: z.boolean().optional(),
      notificationWaterReminders: z.boolean().optional(),
      notificationGoalReminders: z.boolean().optional(),
      notificationSocialUpdates: z.boolean().optional(),
    });

    const body = await request.json();
    const validation = updatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { theme, language, units, notifications, ...rest } = validation.data;

    // 把舊版 notifications 物件對應到新版欄位
    const notifFields: Record<string, boolean> = {};
    if (notifications?.mealReminder !== undefined) {
      notifFields.notificationMealReminders = notifications.mealReminder;
    }
    if (notifications?.achievementNotif !== undefined) {
      notifFields.notificationGoalReminders = notifications.achievementNotif;
    }

    const updateData = {
      ...(theme && { theme }),
      ...(language && { language }),
      ...(units && { units }),
      ...(rest.notificationMealReminders !== undefined && { notificationMealReminders: rest.notificationMealReminders }),
      ...(rest.notificationWaterReminders !== undefined && { notificationWaterReminders: rest.notificationWaterReminders }),
      ...(rest.notificationGoalReminders !== undefined && { notificationGoalReminders: rest.notificationGoalReminders }),
      ...(rest.notificationSocialUpdates !== undefined && { notificationSocialUpdates: rest.notificationSocialUpdates }),
      ...notifFields,
    };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        theme: theme || 'LIGHT',
        language: language || 'zh-TW',
        units: units || 'METRIC',
        notificationMealReminders: notifFields.notificationMealReminders ?? true,
        notificationWaterReminders: notifFields.notificationWaterReminders ?? true,
        notificationGoalReminders: notifFields.notificationGoalReminders ?? true,
        notificationSocialUpdates: true,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
