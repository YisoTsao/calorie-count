import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError } from '@/lib/errors';

/**
 * GET /api/auth/verify?token=xxx
 * 驗證 Email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      throw new ValidationError('缺少驗證 Token');
    }

    // 查找驗證 Token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!verificationToken) {
      throw new NotFoundError('無效的驗證 Token');
    }

    // 檢查 Token 是否過期
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      throw new ValidationError('驗證 Token 已過期');
    }

    // 更新用戶驗證狀態
    await prisma.user.update({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // 刪除已使用的 Token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      createSuccessResponse({
        message: 'Email 驗證成功！您現在可以登入了。',
      })
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse(error.message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse(error.message, 'NOT_FOUND'),
        { status: 404 }
      );
    }

    console.error('Verify email error:', error);
    return NextResponse.json(
      createErrorResponse('驗證失敗，請稍後再試', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
