import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';
import { z } from 'zod';

const bodySchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(100),
});

/** POST /api/admin/foods/bulk-delete — delete multiple foods by id */
export async function POST(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '資料驗證失敗', details: parsed.error.issues }, { status: 400 });
  }

  const { ids } = parsed.data;
  const result = await prisma.food.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ deleted: result.count });
}
