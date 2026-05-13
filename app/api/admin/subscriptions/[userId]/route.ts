import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAdminAccess } from '@/lib/rbac';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const patchSchema = z.object({
  plan: z.enum(['FREE', 'PREMIUM', 'PRO']).optional(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIALING']).optional(),
  currentPeriodEnd: z.string().datetime().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    const denied = checkAdminAccess(session, 'ADMIN');
    if (denied) return denied;

    const { userId } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    const { plan, status, currentPeriodEnd } = parsed.data;
    if (!plan && !status && !currentPeriodEnd) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '請提供至少一個欄位'), { status: 400 });
    }

    const updated = await prisma.userSubscription.update({
      where: { userId },
      data: {
        ...(plan ? { plan } : {}),
        ...(status ? { status } : {}),
        ...(currentPeriodEnd ? { currentPeriodEnd: new Date(currentPeriodEnd) } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(createSuccessResponse({
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      plan: updated.plan,
      status: updated.status,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      updatedAt: updated.updatedAt,
    }));
  } catch (error) {
    console.error('Admin subscription PATCH error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新失敗'), { status: 500 });
  }
}
