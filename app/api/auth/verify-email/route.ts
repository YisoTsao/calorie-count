import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

/**
 * POST /api/auth/verify-email
 * 驗證 Email
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '缺少驗證 token'), {
        status: 400,
      });
    }

    // 查找驗證 token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '無效的驗證 token'), {
        status: 404,
      });
    }

    // 檢查 token 是否過期
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(createErrorResponse('EXPIRED', '驗證 token 已過期，請重新申請'), {
        status: 400,
      });
    }

    // 更新使用者的 emailVerified 狀態
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    // 刪除已使用的 token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      createSuccessResponse({
        user,
        message: 'Email 驗證成功！您現在可以登入了。',
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Email 驗證錯誤:', err);

    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', 'Email 驗證失敗，請稍後再試'), {
      status: 500,
    });
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * 驗證 Email (支援 GET 請求以便從郵件連結直接驗證)
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '缺少驗證 token'), {
      status: 400,
    });
  }

  // 複用 POST 邏輯
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
