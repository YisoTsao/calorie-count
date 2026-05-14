import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const convSession = await prisma.conversationSession.findFirst({
      where: { id, userId: session.user.id, status: 'ACTIVE' },
    });

    if (!convSession) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '對話不存在或已結束'),
        { status: 404 }
      );
    }

    await prisma.conversationSession.update({
      where: { id },
      data: { status: 'ABANDONED' },
    });

    return NextResponse.json(createSuccessResponse({ abandoned: true }));
  } catch (error) {
    console.error('[AI Conversation Delete] Error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '操作失敗'),
      { status: 500 }
    );
  }
}
