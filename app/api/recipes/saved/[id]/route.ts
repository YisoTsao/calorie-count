import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    // 確認擁有權
    const saved = await prisma.savedRecipe.findUnique({ where: { id } });
    if (!saved || saved.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到此收藏'), { status: 404 });
    }

    await prisma.savedRecipe.delete({ where: { id } });
    return NextResponse.json(createSuccessResponse({ id }));
  } catch (error) {
    console.error('Saved recipes DELETE error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '刪除失敗'), { status: 500 });
  }
}
