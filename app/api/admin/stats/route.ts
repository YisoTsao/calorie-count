import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';

/** GET /api/admin/stats — aggregated stats for admin dashboard */
export async function GET(_req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const [totalUsers, activeUsers, systemFoods, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.food.count({ where: { source: 'SYSTEM' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ totalUsers, activeUsers, systemFoods, recentUsers });
}
