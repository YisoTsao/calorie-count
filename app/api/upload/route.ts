import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { uploadImage } from '@/lib/image-upload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '請上傳圖片'), {
        status: 400,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '圖片大小不能超過 10MB'),
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '只支援 JPG, PNG, WebP 格式'),
        { status: 400 }
      );
    }

    const { url, error } = await uploadImage(file, `kitchen/${session.user.id}`);

    if (error || !url) {
      return NextResponse.json(
        createErrorResponse('UPLOAD_FAILED', error ?? '圖片上傳失敗'),
        { status: 500 }
      );
    }

    return NextResponse.json(createSuccessResponse({ url }));
  } catch (err) {
    console.error('[/api/upload] Error:', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '伺服器錯誤'),
      { status: 500 }
    );
  }
}
