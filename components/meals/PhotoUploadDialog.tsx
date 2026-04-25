'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageAnalyzed: (recognitionId: string) => void;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  onImageAnalyzed,
  mealType,
}: PhotoUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('無法啟動相機:', error);
      alert('無法啟動相機,請檢查權限設定');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'meal.jpg');
      formData.append('mealType', mealType);

      // Upload and analyze
      const uploadResponse = await fetch('/api/recognition/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上傳失敗');
      }

      const data = await uploadResponse.json();

      if (data.data?.recognition?.id) {
        onImageAnalyzed(data.data.recognition.id);
        handleClose();
      } else {
        throw new Error('辨識失敗');
      }
    } catch (error) {
      console.error('分析失敗:', error);
      alert('分析失敗,請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setSelectedImage(null);
    setActiveTab('upload');
    onOpenChange(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'camera' | 'upload');
    if (value === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle>拍照或上傳照片</DialogTitle>
          <DialogDescription>拍攝或上傳食物照片,AI 將自動辨識並計算營養成分</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex flex-1 flex-col px-6 pb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              上傳照片
            </TabsTrigger>
            <TabsTrigger value="camera">
              <Camera className="mr-2 h-4 w-4" />
              拍照
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 flex-1">
            <div className="space-y-4">
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center transition-colors hover:border-primary/50"
                >
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">點擊上傳照片</p>
                  <p className="text-sm text-muted-foreground">支援 JPG、PNG 格式,最大 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={selectedImage}
                    alt="Selected food"
                    width={800}
                    height={600}
                    className="h-auto max-h-[400px] w-full rounded-lg object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="camera" className="mt-4 flex-1">
            <div className="space-y-4">
              {!selectedImage ? (
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-auto max-h-[400px] w-full"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraReady && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="h-16 w-16 rounded-full p-0"
                      >
                        <Camera className="h-6 w-6" />
                      </Button>
                    </div>
                  )}

                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <p className="text-white">正在啟動相機...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={selectedImage}
                    alt="Captured food"
                    width={800}
                    height={600}
                    className="h-auto max-h-[400px] w-full rounded-lg object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => {
                      setSelectedImage(null);
                      startCamera();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedImage && (
          <div className="border-t px-6 pb-6 pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isAnalyzing}
              >
                取消
              </Button>
              <Button onClick={handleAnalyze} className="flex-1" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '開始分析'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
