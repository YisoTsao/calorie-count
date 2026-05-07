import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import { deleteImage } from '@/lib/image-upload';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

/**
 * 從 Supabase Storage public URL 解析出 bucket 和 path
 * URL 格式：{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
 */
function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  console.log('Parsing storage URL:', url);
  if (!url || !SUPABASE_URL) return null;
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  const slashIdx = rest.indexOf('/');
  if (slashIdx === -1) return null;
  return { bucket: rest.slice(0, slashIdx), path: rest.slice(slashIdx + 1) };
}

// ==================== GET: 查詢單筆飲食記錄 ====================

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        foods: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!meal) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到飲食記錄'), { status: 404 });
    }

    // 驗證權限
    if (meal.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('FORBIDDEN', '無權限存取'), { status: 403 });
    }

    return NextResponse.json(createSuccessResponse({ meal }));
  } catch (error) {
    console.error('Get meal error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}

// ==================== PATCH: 更新飲食記錄 ====================

const updateMealSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']).optional(),
  mealDate: z.string().optional(),
  notes: z.string().optional(),
  foods: z
    .array(
      z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        portion: z.string().min(1),
        portionSize: z.number().positive(),
        portionUnit: z.string().min(1),
        calories: z.number().min(0),
        protein: z.number().min(0),
        carbs: z.number().min(0),
        fat: z.number().min(0),
        fiber: z.number().min(0).optional(),
        sugar: z.number().min(0).optional(),
        sodium: z.number().min(0).optional(),
        servings: z.number().positive().optional().default(1),
      })
    )
    .optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const meal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!meal || meal.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到飲食記錄'), { status: 404 });
    }

    const body = await req.json();

    // 驗證輸入
    const validation = updateMealSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', firstError.message), {
        status: 400,
      });
    }

    const { mealType, mealDate, notes, foods } = validation.data;

    // 更新飲食記錄
    const updated = await prisma.meal.update({
      where: { id },
      data: {
        ...(mealType && { mealType }),
        ...(mealDate && { mealDate: new Date(mealDate) }),
        ...(notes !== undefined && { notes }),
        ...(foods && {
          foods: {
            deleteMany: {},
            create: foods.map((food) => ({
              name: food.name,
              nameEn: food.nameEn,
              portion: food.portion,
              portionSize: food.portionSize,
              portionUnit: food.portionUnit,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              fiber: food.fiber,
              sugar: food.sugar,
              sodium: food.sodium,
              servings: food.servings || 1,
            })),
          },
        }),
      },
      include: { foods: true },
    });

    return NextResponse.json(createSuccessResponse({ meal: updated }));
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新失敗'), { status: 500 });
  }
}

// ==================== DELETE: 刪除飲食記錄 ====================

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const { id } = await params;

    const meal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!meal || meal.userId !== session.user.id) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', '找不到飲食記錄'), { status: 404 });
    }

    // 若有 sourceRecognitionId，刪除 Supabase Storage 上的掃描圖片
    if (meal.sourceRecognitionId) {
      try {
        const recognition = await prisma.foodRecognition.findUnique({
          where: { id: meal.sourceRecognitionId },
          select: { imageUrl: true },
        });
        if (recognition?.imageUrl) {
          const parsed = parseStorageUrl(recognition.imageUrl);
          if (parsed) {
            await deleteImage(parsed.bucket, parsed.path);
          }
        }
      } catch (imgErr) {
        // 圖片刪除失敗不阻止餐點刪除，靜默記錄
        console.warn('刪除掃描圖片失敗（不影響餐點刪除）:', imgErr);
      }
    }

    await prisma.meal.delete({
      where: { id },
    });

    return NextResponse.json(createSuccessResponse({ message: '刪除成功' }));
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '刪除失敗'), { status: 500 });
  }
}
