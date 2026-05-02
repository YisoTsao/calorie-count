import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { uploadImage, validateImageFile } from '@/lib/image-upload';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    // 確認辨識記錄存在且屬於當前使用者
    const recognition = await prisma.foodRecognition.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!recognition) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到辨識記錄'), { status: 404 });
    }

    if (recognition.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('FORBIDDEN', '無權限存取'), { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(createErrorResponse('BAD_REQUEST', '請選擇圖片檔案'), {
        status: 400,
      });
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', validation.error || '圖片格式錯誤'),
        { status: 400 }
      );
    }

    // 上傳到 food-scans bucket
    const { url, error } = await uploadImage(file, `scans/${session.user.id}`);

    if (error || !url) {
      return NextResponse.json(createErrorResponse('UPLOAD_ERROR', error || '上傳失敗'), {
        status: 500,
      });
    }

    // 更新辨識記錄的 imageUrl
    const updated = await prisma.foodRecognition.update({
      where: { id },
      data: { imageUrl: url },
      select: { id: true, imageUrl: true },
    });

    return NextResponse.json(createSuccessResponse({ imageUrl: updated.imageUrl }));
  } catch (err) {
    console.error('更換掃描圖片錯誤:', err);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '照片更換失敗'), {
      status: 500,
    });
  }
}
