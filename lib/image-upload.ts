import { createAdminClient } from '@/utils/supabase/admin';
import { getStorageUrl } from '@/lib/storage-url';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_SIZE = 400; // 頭像尺寸 400x400

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * 驗證圖片檔案
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: '請選擇圖片檔案' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '圖片大小不能超過 5MB' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: '只支援 JPG, PNG, WebP 格式' };
  }

  return { valid: true };
}

/**
 * 壓縮圖片（伺服器端，使用 canvas-free approach）
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageUploadOptions = {}
): Promise<Buffer> {
  // 伺服器端不再做壓縮，壓縮在客戶端完成
  // 此處保留介面相容性
  return buffer;
}

/**
 * 處理頭像圖片（伺服器端不再做裁切，客戶端已壓縮）
 */
export async function processAvatar(buffer: Buffer): Promise<Buffer> {
  return buffer;
}

/**
 * 上傳圖片到 Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder: string = 'uploads'
): Promise<{ url: string; error?: string }> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: '', error: validation.error };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const path = `${folder}/${timestamp}-${uuid}.webp`;

    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from('food-scans')
      .upload(path, buffer, {
        contentType: file.type.startsWith('image/') ? 'image/webp' : file.type,
        upsert: false,
      });

    if (error) {
      console.error('圖片上傳失敗:', error.message);
      return { url: '', error: '圖片上傳失敗,請稍後再試' };
    }

    return { url: getStorageUrl('food-scans', path) };
  } catch (error) {
    console.error('圖片上傳失敗:', error);
    return { url: '', error: '圖片上傳失敗,請稍後再試' };
  }
}

/**
 * 上傳頭像到 Supabase Storage avatars bucket
 * 本機開發（未設定 NEXT_PUBLIC_SUPABASE_URL）時，退回使用本地檔案系統
 */
export async function uploadAvatar(file: File, userId?: string): Promise<{ url: string; error?: string }> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: '', error: validation.error };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用固定路徑（不帶 timestamp）確保每次上傳覆蓋同一個 URL
    // 這樣 user.image URL 永遠不變，不需更新資料庫
    const prefix = userId ?? 'unknown';
    const storagePath = `${prefix}/avatar.webp`;

    // 本機開發 fallback：無 Supabase 設定時寫入 public/uploads/avatars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { mkdir, writeFile } = await import('fs/promises');
      const { join } = await import('path');
      const dir = join(process.cwd(), 'public', 'uploads', 'avatars', prefix);
      await mkdir(dir, { recursive: true });
      // 本機用固定檔名 avatar.webp（瀏覽器會因路徑一致而快取，加 ?t= 讓客戶端知道更新）
      await writeFile(join(dir, 'avatar.webp'), buffer);
      return { url: `/uploads/avatars/${prefix}/avatar.webp?t=${Date.now()}` };
    }

    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      console.error('頭像上傳失敗:', error.message);
      return { url: '', error: `頭像上傳失敗: ${error.message}` };
    }

    return { url: getStorageUrl('avatars', storagePath) + `?t=${Date.now()}` };
  } catch (error) {
    console.error('頭像上傳失敗:', error);
    return { url: '', error: '頭像上傳失敗,請稍後再試' };
  }
}

/**
 * 刪除圖片（從 Supabase Storage）
 */
export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('圖片刪除失敗:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('圖片刪除失敗:', error);
    return false;
  }
}
