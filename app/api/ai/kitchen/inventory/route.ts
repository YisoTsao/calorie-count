import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const inventory = await prisma.kitchenInventory.findUnique({
      where: { userId: session.user.id },
      include: {
        ingredients: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(createSuccessResponse(inventory));
  } catch (error) {
    console.error('Kitchen inventory GET error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '查詢失敗'), { status: 500 });
  }
}

const patchSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().max(50),
      category: z.string().max(20),
      quantity: z.string().max(30),
      isAvailable: z.boolean().optional(),
    })
  ),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', '請先登入'), { status: 401 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', '無效輸入'), { status: 400 });
    }

    // 確保庫存存在
    const inventory = await prisma.kitchenInventory.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, scanImages: [] },
      update: {},
    });

    // 逐項更新或新增
    for (const item of parsed.data.ingredients) {
      if (item.id) {
        await prisma.kitchenIngredient.updateMany({
          where: { id: item.id, inventoryId: inventory.id },
          data: {
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            isAvailable: item.isAvailable ?? true,
          },
        });
      } else {
        await prisma.kitchenIngredient.create({
          data: {
            inventoryId: inventory.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            addedVia: 'MANUAL',
          },
        });
      }
    }

    const result = await prisma.kitchenInventory.findUnique({
      where: { userId: session.user.id },
      include: { ingredients: { where: { isAvailable: true } } },
    });

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    console.error('Kitchen inventory PATCH error:', error);
    return NextResponse.json(createErrorResponse('INTERNAL_ERROR', '更新失敗'), { status: 500 });
  }
}
