'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  maxSize?: number; // in MB
}

export function ImageUpload({ onUpload, maxSize = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      // 驗證檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案');
        return;
      }

      // 驗證檔案大小
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`檔案大小不可超過 ${maxSize}MB`);
        return;
      }

      // 產生預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      onUpload(file);
    },
    [maxSize, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  if (preview) {
    return (
      <div className="relative w-full h-64">
        <Image
          src={preview}
          alt="Preview"
          fill
          className="object-cover rounded-lg"
        />
        <Button
          variant="destructive"
          size="icon"
          onClick={clearPreview}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8
        transition-colors cursor-pointer
        ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
        }
      `}
    >
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          拖曳圖片到此處或點擊上傳
        </p>
        <p className="text-xs text-gray-500">
          支援 JPG, PNG, WebP (最大 {maxSize}MB)
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}
