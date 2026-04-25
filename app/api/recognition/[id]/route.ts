import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { updateFoodsSchema } from '@/lib/validations/food';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const recognition = await prisma.foodRecognition.findUnique({
      where: { id },
      include: {
        foods: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!recognition) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到辨識記錄'), { status: 404 });
    }

    // 驗證權限
    if (recognition.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('FORBIDDEN', '無權限存取'), { status: 403 });
    }

    return NextResponse.json(createSuccessResponse({ recognition }));
  } catch (error) {
    console.error('Get recognition error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const recognition = await prisma.foodRecognition.findUnique({
      where: { id },
    });

    if (!recognition || recognition.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到辨識記錄'), { status: 404 });
    }

    const body = await req.json();

    // 驗證輸入資料
    const validationResult = updateFoodsSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', firstError.message), {
        status: 400,
      });
    }

    const { foods } = validationResult.data;

    // 更新辨識狀態為已編輯
    await prisma.foodRecognition.update({
      where: { id },
      data: {
        status: 'EDITED',
        foods: {
          deleteMany: {},
          create: foods.map((food) => ({
            ...food,
            isEdited: true,
          })),
        },
      },
    });

    const updated = await prisma.foodRecognition.findUnique({
      where: { id },
      include: { foods: true },
    });

    return NextResponse.json(createSuccessResponse({ recognition: updated }));
  } catch (error) {
    console.error('Update recognition error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新失敗'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const recognition = await prisma.foodRecognition.findUnique({
      where: { id },
    });

    if (!recognition || recognition.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到辨識記錄'), { status: 404 });
    }

    await prisma.foodRecognition.delete({
      where: { id },
    });

    return NextResponse.json(createSuccessResponse({ message: '刪除成功' }));
  } catch (error) {
    console.error('Delete recognition error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '刪除失敗'), { status: 500 });
  }
}
