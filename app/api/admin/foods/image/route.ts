import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';
import { uploadImage } from '@/lib/image-upload';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** POST /api/admin/foods/image?foodId=xxx — 上傳食物圖片 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const foodId = searchParams.get('foodId');
  if (!foodId) return NextResponse.json({ error: '缺少 foodId' }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) return NextResponse.json({ error: '請上傳圖片' }, { status: 400 });

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '圖片大小不能超過 5MB' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: '只支援 JPG、PNG、WebP 格式' }, { status: 400 });
  }

  const food = await prisma.food.findUnique({ where: { id: foodId }, select: { id: true } });
  if (!food) return NextResponse.json({ error: '食物不存在' }, { status: 404 });

  const result = await uploadImage(file, `foods/${foodId}`);

  await prisma.food.update({ where: { id: foodId }, data: { imageUrl: result.url } });

  return NextResponse.json({ imageUrl: result.url });
}
