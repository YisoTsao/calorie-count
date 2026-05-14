import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAdminAccess } from '@/lib/rbac';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const denied = checkAdminAccess(session, 'ADMIN');
    if (denied) return denied;

    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = subscriptions.map((s) => ({
      userId: s.userId,
      name: s.user.name,
      email: s.user.email,
      plan: s.plan,
      status: s.status,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    console.error('Admin subscriptions GET error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}
