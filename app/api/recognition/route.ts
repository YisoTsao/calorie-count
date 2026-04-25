import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') as
      | 'PROCESSING'
      | 'COMPLETED'
      | 'FAILED'
      | 'EDITED'
      | null;

    const where = {
      userId: session.user.id,
      ...(status && { status }),
    };

    const [recognitions, total] = await Promise.all([
      prisma.foodRecognition.findMany({
        where,
        include: {
          foods: true,
          _count: {
            select: { foods: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.foodRecognition.count({ where }),
    ]);

    return NextResponse.json(
      createSuccessResponse({
        recognitions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    );
  } catch (error) {
    console.error('List recognitions error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}
