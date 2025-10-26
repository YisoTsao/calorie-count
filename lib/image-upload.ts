import sharp from 'sharp';
import { put } from '@vercel/blob';

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
 * 壓縮圖片
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageUploadOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 80,
    format = 'webp',
  } = options;

  let image = sharp(buffer);

  // 取得圖片資訊
  const metadata = await image.metadata();

  // 如果圖片超過最大尺寸,進行縮放
  if (metadata.width && metadata.width > maxWidth || metadata.height && metadata.height > maxHeight) {
    image = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // 轉換格式並壓縮
  if (format === 'jpeg') {
    image = image.jpeg({ quality });
  } else if (format === 'png') {
    image = image.png({ quality });
  } else {
    image = image.webp({ quality });
  }

  return await image.toBuffer();
}

/**
 * 處理頭像圖片 (正方形裁切)
 */
export async function processAvatar(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toBuffer();
}

/**
 * 上傳圖片到 Vercel Blob
 */
export async function uploadImage(
  file: File,
  folder: string = 'uploads'
): Promise<{ url: string; error?: string }> {
  try {
    // 驗證檔案
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: '', error: validation.error };
    }

    // 讀取檔案
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 壓縮圖片
    const compressedBuffer = await compressImage(buffer);

    // 生成檔名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${folder}/${timestamp}-${randomString}.webp`;

    // 上傳到 Vercel Blob
    const blob = await put(filename, compressedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    return { url: blob.url };
  } catch (error) {
    console.error('圖片上傳失敗:', error);
    return { url: '', error: '圖片上傳失敗,請稍後再試' };
  }
}

/**
 * 上傳頭像
 */
export async function uploadAvatar(file: File): Promise<{ url: string; error?: string }> {
  try {
    // 驗證檔案
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: '', error: validation.error };
    }

    // 讀取檔案
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 處理頭像 (裁切成正方形並壓縮)
    const processedBuffer = await processAvatar(buffer);

    // 生成檔名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `avatars/${timestamp}-${randomString}.webp`;

    // 上傳到 Vercel Blob
    const blob = await put(filename, processedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    return { url: blob.url };
  } catch (error) {
    console.error('頭像上傳失敗:', error);
    return { url: '', error: '頭像上傳失敗,請稍後再試' };
  }
}

/**
 * 刪除圖片 (從 Vercel Blob)
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Vercel Blob 的刪除功能需要另外實作
    // 這裡暫時只記錄,實際刪除可在後台定期清理
    console.log('標記刪除圖片:', url);
    return true;
  } catch (error) {
    console.error('圖片刪除失敗:', error);
    return false;
  }
}
