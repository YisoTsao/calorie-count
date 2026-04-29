import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL;

/**
 * 取得公開圖片 URL
 * 若設定了 CDN_BASE_URL，回傳 CDN URL；否則回傳 Supabase public URL
 */
export function getStorageUrl(bucket: string, path: string): string {
  if (CDN_BASE_URL) {
    return `${CDN_BASE_URL}/${bucket}/${path}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * 產生私有圖片 signed URL（需在 Server Component 或 Route Handler 中使用）
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Signed URL 產生失敗:', error.message);
    return null;
  }

  return data.signedUrl;
}
