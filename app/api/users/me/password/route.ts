import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { passwordChangeSchema } from '@/lib/validations/password';
import { compare, hash } from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權'), { status: 401 });
    }

    const body = await req.json();

    // 驗證輸入
    const validated = passwordChangeSchema.parse(body);

    // 取得使用者資料
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', '此帳號使用 OAuth 登入,無法修改密碼'),
        { status: 400 }
      );
    }

    // 驗證當前密碼
    const isValidPassword = await compare(validated.currentPassword, user.password);

    if (!isValidPassword) {
      return NextResponse.json(createErrorResponse('BAD_REQUEST', '當前密碼錯誤'), { status: 400 });
    }

    // 加密新密碼
    const hashedPassword = await hash(validated.newPassword, 12);

    // 更新密碼
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      createSuccessResponse({
        message: '密碼修改成功',
      })
    );
  } catch (error) {
    console.error('密碼修改錯誤:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '輸入資料格式錯誤'), {
        status: 400,
      });
    }

    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '密碼修改失敗'), {
      status: 500,
    });
  }
}
