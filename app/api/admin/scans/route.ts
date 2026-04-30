import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';

/** GET /api/admin/scans — list AI food recognition records */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'SUPPORT');
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const q = searchParams.get('q')?.trim() ?? '';
  const status = searchParams.get('status')?.trim() ?? '';
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where['status'] = status;
  if (q) {
    where['user'] = {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  const [total, records] = await Promise.all([
    prisma.foodRecognition.count({ where }),
    prisma.foodRecognition.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        confidence: true,
        imageUrl: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        foods: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            portionSize: true,
            portionUnit: true,
            confidence: true,
          },
        },
        _count: {
          select: { foods: true },
        },
      },
    }),
  ]);

  return NextResponse.json({ records, total, page, limit });
}
