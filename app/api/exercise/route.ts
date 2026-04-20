import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Exercise types and their MET values (Metabolic Equivalent of Task)
const EXERCISE_TYPES = {
  '慢跑': 7.0,
  '快跑': 11.0,
  '步行': 3.5,
  '游泳': 8.0,
  '騎自行車': 6.8,
  '重量訓練': 6.0,
  '瑜伽': 3.0,
  '有氧運動': 7.3,
  '爬樓梯': 8.8,
  '跳繩': 12.3,
  '籃球': 6.5,
  '羽毛球': 5.5,
  '網球': 7.3,
  '其他': 5.0,
};

// Calculate calories burned: MET × weight(kg) × duration(hours)
function calculateCalories(type: string, duration: number, weight: number = 70): number {
  const met = EXERCISE_TYPES[type as keyof typeof EXERCISE_TYPES] || 5.0;
  const hours = duration / 60;
  return met * weight * hours;
}

// POST /api/exercise - Add exercise record
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const addExerciseSchema = z.object({
      type: z.string().min(1).max(50),
      duration: z.number().min(1).max(600), // 1-600 分鐘
      calories: z.number().min(0).optional(), // 可選,自動計算
      date: z.string().optional(),
      notes: z.string().max(500).optional(),
    });

    const body = await request.json();
    const validation = addExerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { type, duration, calories, date, notes } = validation.data;
    // Always use UTC midnight so the date stored matches what the GET query expects
    const now = new Date();
    const recordDate = date
      ? new Date(date + 'T00:00:00.000Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Get user's weight for calorie calculation
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { weight: true },
    });

    const weight = userProfile?.weight || 70; // Default 70kg
    const calculatedCalories = calories || calculateCalories(type, duration, weight);

    const exercise = await prisma.exercise.create({
      data: {
        userId: session.user.id,
        type,
        duration,
        calories: calculatedCalories,
        date: recordDate,
        time: new Date(),
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: { exercise },
    });
  } catch (error) {
    console.error('Add exercise error:', error);
    return NextResponse.json(
      { error: '新增失敗' },
      { status: 500 }
    );
  }
}

// GET /api/exercise?date=YYYY-MM-DD or ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=N - Get exercises
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');
    
    const whereClause: {
      userId: string;
      date?: {
        gte?: Date;
        lt?: Date;
      };
    } = {
      userId: session.user.id,
    };

    // Single date query
    if (dateParam) {
      const queryDate = new Date(dateParam + 'T00:00:00.000Z');
      const nextDate = new Date(dateParam + 'T00:00:00.000Z');
      nextDate.setDate(nextDate.getDate() + 1);
      
      whereClause.date = {
        gte: queryDate,
        lt: nextDate,
      };
    }
    // Date range query
    else if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam + 'T00:00:00.000Z');
      const endDate = new Date(endDateParam + 'T00:00:00.000Z');
      endDate.setDate(endDate.getDate() + 1); // Include end date
      
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      take: limitParam ? parseInt(limitParam) : undefined,
    });

    // Calculate totals
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);

    return NextResponse.json({
      success: true,
      data: {
        exercises,
        totals: {
          duration: totalDuration,
          calories: totalCalories,
          count: exercises.length,
        },
        dateRange: {
          start: startDateParam || dateParam,
          end: endDateParam || dateParam,
        },
      },
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    return NextResponse.json(
      { error: '查詢失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercise?id=xxx - Delete an exercise record
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
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: '找不到此記錄或無權限刪除' },
        { status: 404 }
      );
    }

    // Delete
    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '已刪除記錄',
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}

// PUT /api/exercise?id=xxx - Update an exercise record
export async function PUT(request: NextRequest) {
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

    const updateExerciseSchema = z.object({
      type: z.string().min(1).max(50).optional(),
      duration: z.number().min(1).max(600).optional(),
      calories: z.number().min(0).optional(),
      notes: z.string().max(500).optional(),
    });

    const body = await request.json();
    const validation = updateExerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Find and verify ownership
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: '找不到此記錄或無權限修改' },
        { status: 404 }
      );
    }

    const { type, duration, calories, notes } = validation.data;
    
    // Recalculate calories if type or duration changed
    let calculatedCalories = calories;
    if ((type || duration) && !calories) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: { weight: true },
      });
      const weight = userProfile?.weight || 70;
      const finalType = type || exercise.type;
      const finalDuration = duration || exercise.duration;
      calculatedCalories = calculateCalories(finalType, finalDuration, weight);
    }

    // Update exercise
    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(duration && { duration }),
        ...(calculatedCalories && { calories: calculatedCalories }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { exercise: updatedExercise },
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    );
  }
}

// GET /api/exercise/types - Get available exercise types
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    data: {
      types: Object.keys(EXERCISE_TYPES),
    },
  });
}
