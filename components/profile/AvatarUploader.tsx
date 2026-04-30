'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { compressForAvatar } from '@/lib/client-image-compress';

interface AvatarUploaderProps {
  currentImage?: string | null;
  userName?: string | null;
  /** 顯示尺寸（px），預設 96 */
  size?: number;
  /**
   * 'immediate'（預設）：選檔後立即壓縮並上傳，適合 profile 頁 header
   * 'deferred'：只預覽，壓縮完後透過 onFileReady 回傳 File，由父層負責在 submit 時上傳
   */
  mode?: 'immediate' | 'deferred';
  /** immediate mode：上傳成功後的 callback */
  onSuccess?: (newUrl: string) => void;
  /** deferred mode：壓縮完成後回呼，父層持有此 File 直到 submit */
  onFileReady?: (file: File) => void;
}

/**
 * 頭像上傳元件
 * - hover 顯示相機 icon 覆蓋層
 * - 點擊後開啟檔案選擇器
 * - 客戶端壓縮為 96×96 WebP
 * - 上傳成功後 router.refresh() 更新 Server Component
 */
export function AvatarUploader({
  currentImage,
  userName,
  size = 96,
  mode = 'immediate',
  onSuccess,
  onFileReady,
}: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const displaySrc = preview ?? currentImage;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 立即顯示本機預覽
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    if (mode === 'deferred') {
      // deferred：只壓縮，回傳給父層，不上傳
      try {
        const compressed = await compressForAvatar(file);
        const webpFile = new File([compressed], 'avatar.webp', { type: 'image/webp' });
        onFileReady?.(webpFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : '處理圖片失敗');
        setPreview(null);
        URL.revokeObjectURL(localUrl);
      }
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    // immediate：立即上傳
    setUploading(true);
    try {
      const compressed = await compressForAvatar(file);
      const webpFile = new File([compressed], 'avatar.webp', { type: 'image/webp' });

      const fd = new FormData();
      fd.append('avatar', webpFile);

      const res = await fetch('/api/users/me/avatar', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || '上傳失敗');
      }

      const newUrl: string = data.data.user.image;
      setPreview(newUrl);
      URL.revokeObjectURL(localUrl);
      onSuccess?.(newUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗');
      setPreview(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className="group relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ width: size, height: size }}
        onClick={() => !uploading && inputRef.current?.click()}
        aria-label="更換頭像"
        disabled={uploading}
      >
        {/* 頭像圖片或首字母 */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          {displaySrc ? (
            <Image
              src={displaySrc}
              alt={userName ?? '頭像'}
              fill
              className="object-cover"
              sizes={`${size}px`}
              unoptimized={displaySrc.startsWith('blob:')}
            />
          ) : (
            <span style={{ fontSize: size * 0.33 }} className="select-none font-semibold">
              {initials}
            </span>
          )}
        </div>

        {/* hover 覆蓋層 */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="animate-spin text-white" style={{ width: size * 0.28, height: size * 0.28 }} />
          ) : (
            <Camera className="text-white" style={{ width: size * 0.28, height: size * 0.28 }} />
          )}
        </div>
      </button>

      {error && <p className="max-w-[180px] text-center text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
