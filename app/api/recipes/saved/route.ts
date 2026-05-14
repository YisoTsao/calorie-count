import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const saveSchema = z.object({
  name: z.string().min(1).max(100),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: z.any(), // 完整 Recipe JSON，存儲為 Prisma Json blob
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const saved = await prisma.savedRecipe.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(createSuccessResponse(saved));
  } catch (error) {
    console.error('Saved recipes GET error:', error);
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
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    // 同名檢查
    const exists = await prisma.savedRecipe.findFirst({
      where: { userId: session.user.id, name: parsed.data.name },
    });
    if (exists) {
      return NextResponse.json(createErrorResponse('CONFLICT', '已在菜單中'), { status: 409 });
    }

    const saved = await prisma.savedRecipe.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: parsed.data.data as any,
      },
    });

    return NextResponse.json(createSuccessResponse(saved), { status: 201 });
  } catch (error) {
    console.error('Saved recipes POST error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '儲存失敗'), { status: 500 });
  }
}
