import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';

/** GET /api/admin/members — list all users */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const q = searchParams.get('q')?.trim() ?? '';
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

/** PATCH /api/admin/members — update a member's role or isActive */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'ADMIN');
  if (deny) return deny;

  const body = (await req.json()) as {
    id?: string;
    role?: 'USER' | 'SUPPORT' | 'EDITOR' | 'ADMIN';
    isActive?: boolean;
  };

  if (!body.id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  // Prevent self-demotion
  if (body.id === session!.user!.id) {
    return NextResponse.json({ error: '無法修改自己的帳號' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.role !== undefined) updateData.role = body.role;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const user = await prisma.user.update({
    where: { id: body.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json({ user });
}

/** DELETE /api/admin/members?id=xxx — hard delete with audit log */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'ADMIN');
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const reason = searchParams.get('reason')?.trim() ?? null;

  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  if (id === session!.user!.id) {
    return NextResponse.json({ error: '無法刪除自己的帳號' }, { status: 400 });
  }

  // Fetch target user + stats snapshot before deletion
  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      _count: {
        select: {
          meals: true,
          weightRecords: true,
          exercises: true,
          waterIntakes: true,
          achievements: true,
          recognitions: true,
        },
      },
    },
  });

  if (!target) return NextResponse.json({ error: '找不到會員' }, { status: 404 });

  // Run in transaction: create audit log → delete user (cascades all related data)
  try {
    await prisma.$transaction([
      prisma.deletedUserLog.create({
        data: {
          originalId: target.id,
          email: target.email,
          name: target.name,
          role: target.role,
          deletedBy: session!.user!.id,
          deletedByEmail: session!.user!.email ?? null,
          reason,
          snapshot: target._count,
        },
      }),
      prisma.user.delete({ where: { id } }),
    ]);
  } catch (err) {
    console.error('[DELETE /api/admin/members]', err);
    return NextResponse.json(
      { error: '刪除失敗', detail: String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
