'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraCapture } from '@/components/scan/camera-capture';
import { ImageUpload } from '@/components/scan/image-upload';
import { BarcodeScanDialog, BarcodeFood } from '@/components/scan/barcode-scan-dialog';
import { compressImageFromSrc } from '@/lib/client-image-compress';

export default function ScanPage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState<{ food: BarcodeFood; cached: boolean } | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'compressing' | 'uploading' | 'analyzing'>(
    'idle'
  );

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
      setUploadStep('compressing');

      // 壓縮圖片
      const compressedBlob = await compressImageFromSrc(imageSrc, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        format: 'image/webp',
      });

      setUploadStep('uploading');

      // 建立 FormData
      const formData = new FormData();
      formData.append('image', compressedBlob, 'food.webp');

      // 上傳圖片
      const uploadResponse = await fetch('/api/recognition/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上傳失敗');
      }

      setUploadStep('analyzing');
      const data = await uploadResponse.json();

      // 跳轉到結果頁面
      router.push(`/scan/result/${data.data.recognition.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('上傳失敗，請重試');
      setUploadStep('idle');
    } finally {
      setIsUploading(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  // Barcode dialog
  if (showBarcodeDialog) {
    return (
      <BarcodeScanDialog
        onFood={(food, cached) => {
          setBarcodeResult({ food, cached });
          setShowBarcodeDialog(false);
        }}
        onClose={() => setShowBarcodeDialog(false)}
      />
    );
  }

  // Loading overlay
  if (isUploading) {
    const stepLabels = {
      compressing: '正在壓縮圖片...',
      uploading: '正在上傳圖片...',
      analyzing: 'AI 正在分析食物...',
      idle: '',
    };
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 animate-pulse text-primary" />
            </div>
            <Loader2 className="absolute inset-0 m-auto h-24 w-24 animate-spin text-primary/30" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{stepLabels[uploadStep]}</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {uploadStep === 'analyzing'
                ? 'AI 正在辨識食物種類與計算營養資訊，請稍候...'
                : '請稍候，即將為您分析食物'}
            </p>
          </div>
          <div className="flex gap-2">
            {(['compressing', 'uploading', 'analyzing'] as const).map((step, i) => (
              <div
                key={step}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  ['compressing', 'uploading', 'analyzing'].indexOf(uploadStep) >= i
                    ? 'scale-125 bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">掃描食物</h1>
        <p className="text-muted-foreground">拍照或上傳食物圖片，AI 將自動辨識營養資訊</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>選擇方式</CardTitle>
          <CardDescription>使用相機拍照或從相簿選擇圖片</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowCamera(true)}
            disabled={isUploading}
          >
            <Camera className="mr-2 h-5 w-5" />
            使用相機拍照
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>

          <ImageUpload onUpload={handleUpload} />
        </CardContent>
      </Card>

      {/* Barcode scan card */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:barcode-scan" className="text-xl text-primary" />
            條碼掃描
          </CardTitle>
          <CardDescription>
            掃描包裝食品條碼，自動查詢 Open Food Facts 全球食品資料庫
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => {
              setBarcodeResult(null);
              setShowBarcodeDialog(true);
            }}
          >
            <Icon icon="mdi:barcode-scan" className="mr-2 text-lg" />
            掃描條碼
          </Button>

          {/* Barcode result preview */}
          {barcodeResult && (
            <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <Icon
                  icon="mdi:check-circle"
                  className="mt-0.5 flex-shrink-0 text-xl text-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{barcodeResult.food.name}</p>
                  {barcodeResult.food.barcode && (
                    <p className="text-xs text-muted-foreground">
                      條碼：{barcodeResult.food.barcode}
                    </p>
                  )}
                  {barcodeResult.cached && (
                    <span className="inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600">
                      本地快取
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="rounded-lg bg-background py-1.5">
                  <p className="font-semibold text-orange-500">{barcodeResult.food.calories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="rounded-lg bg-background py-1.5">
                  <p className="font-semibold text-blue-500">{barcodeResult.food.protein}g</p>
                  <p className="text-xs text-muted-foreground">蛋白質</p>
                </div>
                <div className="rounded-lg bg-background py-1.5">
                  <p className="font-semibold text-amber-500">{barcodeResult.food.carbs}g</p>
                  <p className="text-xs text-muted-foreground">碳水</p>
                </div>
                <div className="rounded-lg bg-background py-1.5">
                  <p className="font-semibold text-rose-500">{barcodeResult.food.fat}g</p>
                  <p className="text-xs text-muted-foreground">脂肪</p>
                </div>
              </div>
              {barcodeResult.food.openFoodFactsUrl && (
                <p className="text-xs text-muted-foreground">
                  資料來源：
                  <a
                    href={barcodeResult.food.openFoodFactsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    Open Food Facts
                  </a>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
