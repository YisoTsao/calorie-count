import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { generateToken } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('請輸入有效的 Email'),
});

// 每次重新發送間隔（秒）
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * POST /api/auth/resend-verification
 * 重新發送 Email 驗證信
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', result.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email } = result.data;

    // 確認用戶存在且尚未驗證
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    // 不回傳 "用戶不存在"，避免 email enumeration 攻擊
    if (!user || user.emailVerified) {
      return NextResponse.json(
        createSuccessResponse({ message: '若此 Email 尚未驗證，驗證信已重新發送。' }),
        { status: 200 }
      );
    }

    // 檢查是否已有未過期的 token（防止濫用）
    const existing = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (existing) {
      const age = (Date.now() - (existing.expires.getTime() - 24 * 60 * 60 * 1000)) / 1000;
      if (age < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - age);
        return NextResponse.json(
          createErrorResponse('RATE_LIMIT', `請稍候 ${remaining} 秒後再試。`),
          { status: 429 }
        );
      }
    }

    // 刪除舊 token，建立新 token
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(createSuccessResponse({ message: '驗證信已重新發送，請查收郵件。' }), {
      status: 200,
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '發送失敗，請稍後再試'), {
      status: 500,
    });
  }
}
