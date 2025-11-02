import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/water - Add water intake
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const addWaterSchema = z.object({
      amount: z.number().min(1).max(5000), // 1ml ~ 5L
      date: z.string().optional(), // 可選,預設今天
    });

    const body = await request.json();
    const validation = addWaterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { amount, date } = validation.data;
    const recordDate = date ? new Date(date) : new Date();
    
    // Set to start of day
    recordDate.setHours(0, 0, 0, 0);

    const waterIntake = await prisma.waterIntake.create({
      data: {
        userId: session.user.id,
        amount,
        date: recordDate,
        time: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { waterIntake },
    });
  } catch (error) {
    console.error('Add water intake error:', error);
    return NextResponse.json(
      { error: '新增失敗' },
      { status: 500 }
    );
  }
}

// GET /api/water?date=YYYY-MM-DD - Get water intake for a date
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    const queryDate = dateParam ? new Date(dateParam) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    // Get all water intakes for the date
    const intakes = await prisma.waterIntake.findMany({
      where: {
        userId: session.user.id,
        date: queryDate,
      },
      orderBy: {
        time: 'desc',
      },
    });

    // Calculate total
    const total = intakes.reduce((sum, intake) => sum + intake.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        intakes,
        total,
        date: queryDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Get water intake error:', error);
    return NextResponse.json(
      { error: '查詢失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/water?id=xxx - Delete a water intake record
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 參數' },
        { status: 400 }
      );
    }

    // Find and verify ownership
    const intake = await prisma.waterIntake.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!intake) {
      return NextResponse.json(
        { error: '找不到此記錄或無權限刪除' },
        { status: 404 }
      );
    }

    // Delete
    await prisma.waterIntake.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '已刪除記錄',
    });
  } catch (error) {
    console.error('Delete water intake error:', error);
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}
