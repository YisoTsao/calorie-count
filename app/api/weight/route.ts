import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Calculate BMI: weight(kg) / height(m)²
function calculateBMI(weight: number, height: number): number {
  if (height <= 0) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// POST /api/weight - Add weight record
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const addWeightSchema = z.object({
      weight: z.number().min(20).max(300), // 20-300 kg
      bodyFat: z.number().min(0).max(100).optional(), // 體脂率 %
      date: z.string().optional(),
      notes: z.string().max(500).optional(),
    });

    const body = await request.json();
    const validation = addWeightSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { weight, bodyFat, date, notes } = validation.data;
    // 使用 UTC 時間避免時區問題
    const recordDate = date ? new Date(date + 'T00:00:00.000Z') : (() => {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      return now;
    })();

    // Get user's height for BMI calculation
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { height: true },
    });

    const height = userProfile?.height || 170; // Default 170cm
    const bmi = calculateBMI(weight, height);

    // Upsert: update if record exists for this user on this date
    const weightRecord = await prisma.weightRecord.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: recordDate,
        },
      },
      create: {
        userId: session.user.id,
        weight,
        bmi,
        bodyFat,
        date: recordDate,
        notes,
      },
      update: {
        weight,
        bmi,
        bodyFat,
        notes,
      },
    });

    // Update user profile if it exists
    try {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { weight },
      });
    } catch {
      // Profile might not exist yet, ignore error
      console.log('Profile not found, skipping weight update');
    }

    return NextResponse.json({
      success: true,
      data: { weightRecord },
    });
  } catch (error) {
    console.error('Add weight record error:', error);
    return NextResponse.json(
      { error: '新增失敗' },
      { status: 500 }
    );
  }
}

// PUT /api/weight - Update weight record (for editing)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const updateWeightSchema = z.object({
      weight: z.number().min(20).max(300),
      bodyFat: z.number().min(0).max(100).optional(),
      date: z.string(), // 必填,用於識別要更新的記錄
      notes: z.string().max(500).optional(),
    });

    const body = await request.json();
    const validation = updateWeightSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { weight, bodyFat, date, notes } = validation.data;
    const recordDate = new Date(date + 'T00:00:00.000Z');

    // Check if record exists and belongs to user
    const existingRecord = await prisma.weightRecord.findFirst({
      where: {
        date: recordDate,
        userId: session.user.id,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: '找不到此記錄' },
        { status: 404 }
      );
    }

    // Get user's height for BMI calculation
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { height: true },
    });

    const height = userProfile?.height || 170;
    const bmi = calculateBMI(weight, height);

    // Update the record by id
    const weightRecord = await prisma.weightRecord.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        weight,
        bmi,
        bodyFat,
        notes,
      },
    });

    // Update user profile
    try {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { weight },
      });
    } catch {
      console.log('Profile not found, skipping weight update');
    }

    return NextResponse.json({
      success: true,
      data: { weightRecord },
    });
  } catch (error) {
    console.error('Update weight record error:', error);
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    );
  }
}

// GET /api/weight?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Get weight history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');

    interface WhereClause {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const where: WhereClause = {
      userId: session.user.id,
    };

    if (startDateParam || endDateParam) {
      where.date = {};
      if (startDateParam) {
        where.date.gte = new Date(startDateParam + 'T00:00:00.000Z');
      }
      if (endDateParam) {
        where.date.lte = new Date(endDateParam + 'T23:59:59.999Z');
      }
    }

    const records = await prisma.weightRecord.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    // Calculate stats
    let stats = null;
    if (records.length > 0) {
      const latestWeight = records[0].weight;
      const oldestWeight = records[records.length - 1].weight;
      const weightChange = latestWeight - oldestWeight;
      const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;

      stats = {
        current: latestWeight,
        change: weightChange,
        average: avgWeight,
        highest: Math.max(...records.map(r => r.weight)),
        lowest: Math.min(...records.map(r => r.weight)),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        records: records.reverse(), // Oldest first for charts
        stats,
      },
    });
  } catch (error) {
    console.error('Get weight records error:', error);
    return NextResponse.json(
      { error: '查詢失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/weight?date=YYYY-MM-DD - Delete a weight record
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: '缺少 date 參數' },
        { status: 400 }
      );
    }

    // 使用 UTC 時間避免時區問題
    const recordDate = new Date(dateParam + 'T00:00:00.000Z');

    // Find and verify ownership
    const record = await prisma.weightRecord.findFirst({
      where: {
        date: recordDate,
        userId: session.user.id,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: '找不到此記錄或無權限刪除' },
        { status: 404 }
      );
    }

    // Delete
    await prisma.weightRecord.delete({
      where: { id: record.id },
    });

    return NextResponse.json({
      success: true,
      message: '已刪除記錄',
    });
  } catch (error) {
    console.error('Delete weight record error:', error);
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}
