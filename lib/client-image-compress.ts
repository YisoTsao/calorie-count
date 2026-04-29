/**
 * 客戶端圖片壓縮工具
 * 避免伺服器端 Sharp 依賴問題
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * 壓縮圖片
 * @param file 原始圖片檔案
 * @param options 壓縮選項
 * @returns 壓縮後的 Blob
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85, format = 'image/webp' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 計算縮放比例
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // 建立 canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法建立 canvas context'));
          return;
        }

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('圖片壓縮失敗'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('圖片載入失敗'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 從 base64 或 URL 壓縮圖片
 * @param imageSrc base64 或 URL
 * @param options 壓縮選項
 * @returns 壓縮後的 Blob
 */
export async function compressImageFromSrc(
  imageSrc: string,
  options: CompressOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85, format = 'image/webp' } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // 計算縮放比例
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // 建立 canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('無法建立 canvas context'));
        return;
      }

      // 繪製圖片
      ctx.drawImage(img, 0, 0, width, height);

      // 轉換為 blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('圖片壓縮失敗'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('圖片載入失敗'));
    };

    img.src = imageSrc;
  });
}

/**
 * 頭像壓縮 preset（96×96px, WebP, ≤200KB）
 */
export async function compressForAvatar(file: File | Blob): Promise<Blob> {
  try {
    return await compressImage(file, {
      maxWidth: 96,
      maxHeight: 96,
      quality: 0.9,
      format: 'image/webp',
    });
  } catch {
    // WebP 不支援時 fallback 為 JPEG
    return await compressImage(file, {
      maxWidth: 96,
      maxHeight: 96,
      quality: 0.85,
      format: 'image/jpeg',
    });
  }
}

/**
 * 掃描圖壓縮 preset（最長邊 1200px, WebP, ≤2MB）
 */
export async function compressForScan(file: File | Blob): Promise<Blob> {
  try {
    return await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/webp',
    });
  } catch {
    return await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
      format: 'image/jpeg',
    });
  }
}

/**
 * 縮圖壓縮 preset（最長邊 400px, WebP, ≤200KB）
 */
export async function compressForThumbnail(file: File | Blob): Promise<Blob> {
  try {
    return await compressImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8,
      format: 'image/webp',
    });
  } catch {
    return await compressImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.85,
      format: 'image/jpeg',
    });
  }
}
