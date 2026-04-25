'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  currentImage?: string | null;
  userName?: string | null;
  onUploadSuccess?: (imageUrl: string) => void;
}

export function AvatarUpload({ currentImage, userName, onUploadSuccess }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '上傳失敗');
      }

      if (data.data?.imageUrl) {
        onUploadSuccess?.(data.data.imageUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '刪除失敗');
      }

      setPreview(null);
      onUploadSuccess?.(null!);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setIsDeleting(false);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={displayImage || undefined} alt={userName || 'User'} />
            <AvatarFallback className="text-3xl">{getInitials(userName)}</AvatarFallback>
          </Avatar>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上傳中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {displayImage ? '更換頭像' : '上傳頭像'}
                </>
              )}
            </Button>

            {displayImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    刪除中...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    移除頭像
                  </>
                )}
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-center text-xs text-muted-foreground">
            支援 JPG, PNG, WebP
            <br />
            檔案大小限制 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
