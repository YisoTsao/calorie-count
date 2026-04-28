import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  nameEn: z.string().max(50).optional().nullable(),
  nameJa: z.string().max(50).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  order: z.number().int().optional(),
});

/** GET /api/admin/categories — list all categories */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const categories = await prisma.foodCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      nameEn: true,
      nameJa: true,
      icon: true,
      order: true,
      _count: { select: { foods: true } },
    },
  });

  return NextResponse.json({ categories });
}

/** POST /api/admin/categories — create a category */
export async function POST(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '資料驗證失敗', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const category = await prisma.foodCategory.create({
    data: parsed.data,
    select: { id: true, name: true, nameEn: true, nameJa: true, icon: true, order: true },
  });

  return NextResponse.json({ category }, { status: 201 });
}

/** PATCH /api/admin/categories — update a category */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const body = (await req.json()) as { id?: string } & z.infer<typeof categorySchema>;
  if (!body.id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  const { id, ...rest } = body;
  const parsed = categorySchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '資料驗證失敗', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.foodCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: '分類不存在' }, { status: 404 });

  const category = await prisma.foodCategory.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, nameEn: true, nameJa: true, icon: true, order: true },
  });

  return NextResponse.json({ category });
}

/** DELETE /api/admin/categories?id=xxx */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'ADMIN');
  if (deny) return deny;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  // Move all foods to uncategorized before deleting
  await prisma.food.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.foodCategory.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
