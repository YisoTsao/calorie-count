import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權'), { status: 401 });
    }

    const body = await req.json();
    const { confirmation } = body;

    // 需要明確確認
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(createErrorResponse('BAD_REQUEST', '請輸入正確的確認文字'), {
        status: 400,
      });
    }

    // 刪除使用者及所有關聯資料 (使用 Prisma cascade delete)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json(
      createSuccessResponse({
        message: '帳號已成功刪除',
      })
    );
  } catch (error) {
    console.error('帳號刪除錯誤:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '帳號刪除失敗'), {
      status: 500,
    });
  }
}
