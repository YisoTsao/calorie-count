import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { ValidationError, ConflictError } from '@/lib/errors';
import { generateToken } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';

/**
 * POST /api/auth/register
 * 用戶註冊
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證輸入
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.issues.map((e) => e.message).join(', '));
    }

    const { email, password, name } = result.data;

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('此 Email 已被註冊');
    }

    // 加密密碼
    const hashedPassword = await hash(password, 12);

    // 建立用戶
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 生成驗證 Token（先刪除舊的，避免 identifier unique 衝突）
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const verificationToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    // 發送驗證郵件（失敗不影響註冊成功，只記錄錯誤）
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Register: 驗證信發送失敗（用戶已建立）:', emailError);
    }

    return NextResponse.json(
      createSuccessResponse({
        user,
        message: '註冊成功！請檢查您的 Email 以驗證帳號。',
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', error.message), {
        status: 400,
      });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json(createErrorResponse('CONFLICT', error.message), {
        status: 409,
      });
    }

    // Prisma unique constraint violation（雙重保護）
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(createErrorResponse('CONFLICT', '此 Email 已被註冊'), {
        status: 409,
      });
    }

    console.error('Register error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '註冊失敗，請稍後再試'), {
      status: 500,
    });
  }
}
