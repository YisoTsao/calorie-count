import { prisma } from '@/lib/prisma';

type AiFeature =
  | 'conversational_diary'
  | 'kitchen_scan'
  | 'recipe_recommend'
  | 'kitchen_chat';

const MONTHLY_QUOTA: Record<string, Record<AiFeature, number>> = {
  FREE: {
    conversational_diary: 20,
    kitchen_scan: 3,
    recipe_recommend: 5,
    kitchen_chat: 10,
  },
  PREMIUM: {
    conversational_diary: 200,
    kitchen_scan: 30,
    recipe_recommend: 60,
    kitchen_chat: 100,
  },
  PRO: {
    conversational_diary: -1,
    kitchen_scan: -1,
    recipe_recommend: -1,
    kitchen_chat: -1,
  },
};

interface QuotaResult {
  allowed: boolean;
  remaining: number;
  plan: string;
  used: number;
  limit: number;
}

export async function checkQuota(
  userId: string,
  feature: AiFeature
): Promise<QuotaResult> {
  // 查詢訂閱（無訂閱記錄 → 視為 FREE）
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
  });
  const plan = sub?.status === 'ACTIVE' ? sub.plan : 'FREE';
  const limit = MONTHLY_QUOTA[plan]?.[feature] ?? MONTHLY_QUOTA.FREE[feature];

  // PRO（unlimited）
  if (limit === -1) {
    return { allowed: true, remaining: Infinity, plan, used: 0, limit: -1 };
  }

  // 查詢本月用量
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await prisma.aiUsageLog.count({
    where: { userId, feature, createdAt: { gte: monthStart } },
  });

  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    plan,
    used,
    limit,
  };
}

/** 新用戶首次存取時，lazy create FREE 訂閱記錄 */
export async function ensureSubscription(userId: string) {
  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'),
    },
    update: {},
  });
}
