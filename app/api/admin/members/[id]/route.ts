import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

const MONTHLY_QUOTA: Record<string, Record<string, number>> = {
  FREE:    { conversational_diary: 20,  kitchen_scan: 3,  recipe_recommend: 5,  kitchen_chat: 10 },
  PREMIUM: { conversational_diary: 200, kitchen_scan: 30, recipe_recommend: 60, kitchen_chat: 100 },
  PRO:     { conversational_diary: -1,  kitchen_scan: -1, recipe_recommend: -1, kitchen_chat: -1 },
};

/** GET /api/admin/members/[id] — 會員詳情 + 本月 AI 用量 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const { id } = await params;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [user, usageRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        subscription: true,
      },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['feature'],
      where: { userId: id, createdAt: { gte: monthStart } },
      _count: { id: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到會員'), { status: 404 });
  }

  const plan = user.subscription?.status === 'ACTIVE' ? (user.subscription.plan ?? 'FREE') : 'FREE';
  const quotaMap = MONTHLY_QUOTA[plan] ?? MONTHLY_QUOTA.FREE;

  const features = ['conversational_diary', 'kitchen_scan', 'recipe_recommend', 'kitchen_chat'] as const;
  const usageMap = Object.fromEntries(usageRows.map((r) => [r.feature, r._count.id]));

  const usage = features.map((feature) => ({
    feature,
    used: usageMap[feature] ?? 0,
    limit: quotaMap[feature] ?? 0,
  }));

  const sub = user.subscription
    ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        updatedAt: user.subscription.updatedAt,
      }
    : null;

  return NextResponse.json(
    createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      subscription: sub,
      usage,
    })
  );
}
