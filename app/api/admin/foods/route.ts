import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const foodSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().nullable(),
  nameJa: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional().nullable(),
  sugar: z.number().min(0).optional().nullable(),
  sodium: z.number().min(0).optional().nullable(),
  servingSize: z.number().min(0).optional().nullable(),
  servingUnit: z.string().max(20).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  source: z.enum(['SYSTEM', 'USER', 'API']).optional(),
});

const foodSelect = {
  id: true,
  name: true,
  nameEn: true,
  nameJa: true,
  description: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  fiber: true,
  sugar: true,
  sodium: true,
  servingSize: true,
  servingUnit: true,
  imageUrl: true,
  source: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, nameEn: true, nameJa: true },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
};

/** GET /api/admin/foods — list system foods (paginated) */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const deny = checkAdminAccess(session, 'SUPPORT');
    if (deny) return deny;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const q = searchParams.get('q')?.trim() ?? '';
    const categoryId = searchParams.get('categoryId')?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Prisma.FoodWhereInput = {
      source: { in: ['SYSTEM', 'API'] },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
              { nameJa: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const [total, foods, categories] = await Promise.all([
      prisma.food.count({ where }),
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: foodSelect,
      }),
      prisma.foodCategory.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, nameEn: true, nameJa: true },
      }),
    ]);

    return NextResponse.json({ foods, total, page, limit, categories });
  } catch (error) {
    console.error('Admin foods GET error:', error);
    return NextResponse.json(
      { error: '載入失敗', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/** POST /api/admin/foods — create a new system food */
export async function POST(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const body = await req.json();
  const parsed = foodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '資料驗證失敗', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { categoryId, source, ...rest } = parsed.data;
  const food = await prisma.food.create({
    data: {
      ...rest,
      source: source ?? 'SYSTEM',
      userId: session!.user!.id,
      ...(categoryId ? { categoryId } : {}),
    },
    select: foodSelect,
  });

  return NextResponse.json({ food }, { status: 201 });
}

/** PUT /api/admin/foods — update a system food */
export async function PUT(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const body = (await req.json()) as { id?: string } & z.infer<typeof foodSchema>;
  if (!body.id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  const { id, categoryId, ...rest } = body;
  const parsed = foodSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '資料驗證失敗', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.food.findUnique({ where: { id }, select: { source: true } });
  if (!existing) return NextResponse.json({ error: '食物不存在' }, { status: 404 });

  const food = await prisma.food.update({
    where: { id },
    data: { ...parsed.data, ...(categoryId !== undefined ? { categoryId } : {}) },
    select: foodSelect,
  });

  return NextResponse.json({ food });
}

/** DELETE /api/admin/foods?id=xxx */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  await prisma.food.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
