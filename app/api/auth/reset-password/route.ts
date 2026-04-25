import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError } from '@/lib/errors';

/**
 * POST /api/auth/reset-password
 * 重置密碼
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證輸入
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map((e) => e.message).join(', '));
    }

    const { token, password } = result.data;

    // 查找重置 Token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new NotFoundError('無效的重置 Token');
    }

    // 檢查 Token 是否過期
    if (resetToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      throw new ValidationError('重置 Token 已過期');
    }

    // 加密新密碼
    const hashedPassword = await hash(password, 12);

    // 更新用戶密碼
    await prisma.user.update({
      where: {
        email: resetToken.identifier,
      },
      data: {
        password: hashedPassword,
      },
    });

    // 刪除已使用的 Token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // 刪除該用戶的所有 Session (強制重新登入)
    await prisma.session.deleteMany({
      where: {
        user: {
          email: resetToken.identifier,
        },
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        message: '密碼已成功重置！請使用新密碼登入。',
      })
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', error.message), {
        status: 400,
      });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', error.message), { status: 404 });
    }

    console.error('Reset password error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '重置密碼失敗，請稍後再試'), {
      status: 500,
    });
  }
}
