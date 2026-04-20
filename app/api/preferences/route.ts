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
          notifications: {
            mealReminder: true,
            achievementNotif: true
          }
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
      notifications: z.object({
        mealReminder: z.boolean().optional(),
        achievementNotif: z.boolean().optional()
      }).optional()
    });

    const body = await request.json();
    const validation = updatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { theme, language, units, notifications } = validation.data;

    // 檢查是否已有偏好設定
    const existing = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    });

    let preferences;
    if (existing) {
      // 更新
      preferences = await prisma.userPreferences.update({
        where: { userId: session.user.id },
        data: {
          ...(theme && { theme }),
          ...(language && { language }),
          ...(units && { units }),
          ...(notifications && { notifications })
        }
      });
    } else {
      // 建立
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          theme: theme || 'LIGHT',
          language: language || 'zh-TW',
          units: units || 'METRIC',
          notifications: notifications || {
            mealReminder: true,
            achievementNotif: true
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
