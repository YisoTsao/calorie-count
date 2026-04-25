import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { uploadAvatar, validateImageFile } from '@/lib/image-upload';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權'), { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(createErrorResponse('BAD_REQUEST', '請選擇圖片檔案'), {
        status: 400,
      });
    }

    // 驗證檔案
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', validation.error || '圖片格式錯誤'),
        { status: 400 }
      );
    }

    // 上傳頭像
    const { url, error } = await uploadAvatar(file);

    if (error) {
      return NextResponse.json(createErrorResponse('UPLOAD_ERROR', error), { status: 500 });
    }

    // 更新使用者頭像
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        user: updatedUser,
        message: '頭像上傳成功',
      })
    );
  } catch (error) {
    console.error('頭像上傳錯誤:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '頭像上傳失敗'), {
      status: 500,
    });
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '未授權'), { status: 401 });
    }

    // 刪除頭像 (設為 null)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        user: updatedUser,
        message: '頭像已刪除',
      })
    );
  } catch (error) {
    console.error('頭像刪除錯誤:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '頭像刪除失敗'), {
      status: 500,
    });
  }
}
