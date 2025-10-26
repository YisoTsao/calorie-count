'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraCapture } from '@/components/scan/camera-capture';
import { ImageUpload } from '@/components/scan/image-upload';

export default function ScanPage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = async (imageSrc: string) => {
    setShowCamera(false);
    await uploadImage(imageSrc);
  };

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      await uploadImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (imageSrc: string) => {
    try {
      setIsUploading(true);

      // 將 base64 轉換為 blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // 建立 FormData
      const formData = new FormData();
      formData.append('image', blob, 'food.jpg');

      // 上傳圖片
      const uploadResponse = await fetch('/api/recognition/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上傳失敗');
      }

      const data = await uploadResponse.json();
      
      // 跳轉到結果頁面
      router.push(`/scan/result/${data.data.recognition.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('上傳失敗，請重試');
    } finally {
      setIsUploading(false);
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">掃描食物</h1>
        <p className="text-muted-foreground">
          拍照或上傳食物圖片，AI 將自動辨識營養資訊
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>選擇方式</CardTitle>
          <CardDescription>
            使用相機拍照或從相簿選擇圖片
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowCamera(true)}
            disabled={isUploading}
          >
            <Camera className="h-5 w-5 mr-2" />
            使用相機拍照
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>

          <ImageUpload onUpload={handleUpload} />
        </CardContent>
      </Card>

      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">上傳中...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
