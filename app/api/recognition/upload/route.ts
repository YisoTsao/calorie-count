import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { recognizeFoodWithRetry, validateRecognitionResult } from '@/lib/ai/food-recognition';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 檢查是否有 Vercel Blob token
const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: NextRequest) {
  try {
    // 驗證使用者
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '請先登入'),
        { status: 401 }
      );
    }

    // 解析表單資料
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '請上傳圖片'),
        { status: 400 }
      );
    }

    // 驗證檔案
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

    // 直接使用上傳的檔案（前端已壓縮）
    const buffer = Buffer.from(await file.arrayBuffer());

    let imageUrl: string;

    // 根據環境選擇儲存方式
    if (hasVercelBlob) {
      // 使用 Vercel Blob (生產環境)
      const fileName = `food-recognition/${session.user.id}/${Date.now()}.webp`;
      const blob = await put(fileName, buffer, {
        access: 'public',
        contentType: file.type,
      });
      imageUrl = blob.url;
    } else {
      // 使用本地檔案系統 (開發環境)
      const publicDir = join(process.cwd(), 'public', 'uploads', 'food-recognition');
      const userDir = join(publicDir, session.user.id);
      
      // 確保目錄存在
      await mkdir(userDir, { recursive: true });
      
      const ext = file.type.split('/')[1] || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const filePath = join(userDir, fileName);
      
      // 儲存檔案
      await writeFile(filePath, buffer);
      
      // 生成公開 URL
      imageUrl = `/uploads/food-recognition/${session.user.id}/${fileName}`;
    }

    // 建立辨識記錄
    const recognition = await prisma.foodRecognition.create({
      data: {
        userId: session.user.id,
        imageUrl: imageUrl,
        status: 'PROCESSING',
      },
    });

    // 異步處理 AI 辨識 (不阻塞回應)
    processRecognition(recognition.id, imageUrl).catch(console.error);

    return NextResponse.json(
      createSuccessResponse({
        recognition: {
          id: recognition.id,
          imageUrl: recognition.imageUrl,
          status: recognition.status,
        },
        message: '圖片上傳成功,正在辨識中...',
      })
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '上傳失敗'),
      { status: 500 }
    );
  }
}

/**
 * 異步處理食物辨識
 */
async function processRecognition(recognitionId: string, imageUrl: string) {
  try {
    // 如果是相對 URL，轉換為完整 URL
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fullImageUrl = `${baseUrl}${imageUrl}`;
    }

    // 呼叫 AI 辨識
    const result = await recognizeFoodWithRetry(fullImageUrl);

    // 驗證結果
    if (!validateRecognitionResult(result)) {
      throw new Error('Invalid recognition result');
    }

    // 儲存辨識結果
    await prisma.foodRecognition.update({
      where: { id: recognitionId },
      data: {
        status: 'COMPLETED',
        confidence: result.confidence,
        rawResult: result.rawResponse as object,
        foods: {
          create: result.foods.map((food) => ({
            name: food.name,
            nameEn: food.nameEn || null,
            portion: food.portion,
            portionSize: food.portionSize,
            portionUnit: food.portionUnit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber || null,
            sugar: food.sugar || null,
            sodium: food.sodium || null,
            confidence: food.confidence || null,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Recognition processing error:', error);

    // 更新為失敗狀態
    await prisma.foodRecognition.update({
      where: { id: recognitionId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : '辨識失敗',
      },
    });
  }
}
