import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
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

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
 */
export async function uploadAvatar(file: File, userId?: string): Promise<{ url: string; error?: string }> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: '', error: validation.error };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const prefix = userId ?? 'unknown';
    const path = `${prefix}/${timestamp}.webp`;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      console.error('頭像上傳失敗:', error.message);
      return { url: '', error: '頭像上傳失敗,請稍後再試' };
    }

    return { url: getStorageUrl('avatars', path) };
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
