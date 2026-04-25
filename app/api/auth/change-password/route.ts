import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '請輸入目前密碼'),
    newPassword: z
      .string()
      .min(8, '新密碼至少需要 8 個字元')
      .regex(/[A-Za-z]/, '新密碼需包含至少一個英文字母')
      .regex(/[0-9]/, '新密碼需包含至少一個數字'),
    confirmPassword: z.string().min(1, '請再次輸入新密碼'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

/**
 * POST /api/auth/change-password
 * 修改密碼（需已登入）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    // 取得使用者目前的密碼 hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: '此帳號使用第三方登入，無法修改密碼' }, { status: 400 });
    }

    // 驗證目前密碼
    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: '目前密碼不正確' }, { status: 400 });
    }

    // 確保新密碼與舊密碼不同
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json({ error: '新密碼不能與目前密碼相同' }, { status: 400 });
    }

    // 加密新密碼
    const hashedPassword = await hash(newPassword, 12);

    // 更新密碼
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: '密碼已成功更新',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: '修改密碼失敗，請稍後再試' }, { status: 500 });
  }
}
