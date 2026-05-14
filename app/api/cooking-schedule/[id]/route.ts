import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const patchSchema = z.object({
  scheduledDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: '無效日期格式' }),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.cookingScheduleEvent.findUnique({ where: { id } });
    if (!event || event.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到此排程'), { status: 404 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    const updated = await prisma.cookingScheduleEvent.update({
      where: { id },
      data: { scheduledDate: new Date(parsed.data.scheduledDate) },
    });

    return NextResponse.json(createSuccessResponse(updated));
  } catch (error) {
    console.error('Cooking schedule PATCH error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新失敗'), { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const event = await prisma.cookingScheduleEvent.findUnique({ where: { id } });
    if (!event || event.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到此排程'), { status: 404 });
    }

    await prisma.cookingScheduleEvent.delete({ where: { id } });
    return NextResponse.json(createSuccessResponse({ id }));
  } catch (error) {
    console.error('Cooking schedule DELETE error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '刪除失敗'), { status: 500 });
  }
}
