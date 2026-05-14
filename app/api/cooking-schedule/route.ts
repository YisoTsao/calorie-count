import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  recipeName: z.string().min(1).max(100),
  scheduledDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: '無效日期格式' }),
  savedRecipeId: z.string().optional(),
  note: z.string().max(200).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // format: YYYY-MM

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 1); // 下個月第一天（exclusive）
    }

    const events = await prisma.cookingScheduleEvent.findMany({
      where: {
        userId: session.user.id,
        ...(startDate && endDate
          ? { scheduledDate: { gte: startDate, lt: endDate } }
          : {}),
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json(createSuccessResponse(events));
  } catch (error) {
    console.error('Cooking schedule GET error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    const event = await prisma.cookingScheduleEvent.create({
      data: {
        userId: session.user.id,
        recipeName: parsed.data.recipeName,
        scheduledDate: new Date(parsed.data.scheduledDate),
        savedRecipeId: parsed.data.savedRecipeId,
        note: parsed.data.note,
      },
    });

    return NextResponse.json(createSuccessResponse(event), { status: 201 });
  } catch (error) {
    console.error('Cooking schedule POST error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '新增失敗'), { status: 500 });
  }
}
