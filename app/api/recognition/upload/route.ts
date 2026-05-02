import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recognizeFoodWithRetry, validateRecognitionResult } from '@/lib/ai/food-recognition';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    // 驗證使用者
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    // 解析表單資料
    const formData = await req.formData();
    const file = formData.get('image') as File;
    // 從 formData 取得 locale（由客戶端 PhotoUploadDialog 附帶）
    const locale = (formData.get('locale') as string | null) ?? 'zh-TW';

    if (!file) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '請上傳圖片'), {
        status: 400,
      });
    }

    // 驗證檔案
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '圖片大小不能超過 10MB'), {
        status: 400,
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '只支援 JPG, PNG, WebP 格式'),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 轉為 base64 data URL 供 AI 分析（不上傳至 Storage，避免 AI 無法存取 localhost）
    const mimeType = ALLOWED_TYPES.includes(file.type) ? file.type : 'image/webp';
    const imageDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // 建立辨識記錄（imageUrl 留空，等使用者確認加入飲食後才上傳至 Supabase）
    const recognition = await prisma.foodRecognition.create({
      data: {
        userId: session.user.id,
        imageUrl: '',

        status: 'PROCESSING',
      },
    });

    // 異步處理 AI 辨識（傳入 base64 data URL，不依賴外部可存取的 URL）
    processRecognition(recognition.id, imageDataUrl, locale).catch(console.error);

    return NextResponse.json(
      createSuccessResponse({
        recognition: {
          id: recognition.id,
          imageUrl: recognition.imageUrl,
          status: recognition.status,
        },
        message: '圖片已接收，正在辨識中...',
      })
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '上傳失敗'), { status: 500 });
  }
}

/**
 * 異步處理食物辨識（使用 base64 data URL，OpenAI 原生支援此格式）
 */
async function processRecognition(recognitionId: string, imageDataUrl: string, locale = 'zh-TW') {
  try {
    // 直接傳 base64 data URL 給 OpenAI，無需外部可存取的 URL
    const result = await recognizeFoodWithRetry(imageDataUrl, 2, locale);

    // 驗證結果
    if (!validateRecognitionResult(result)) {
      throw new Error('AI 回傳格式錯誤，請重試');
    }

    // 儲存辨識結果（foods 為空表示圖片中未偵測到食物）
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
