'use client';

import { Loader2 } from 'lucide-react';

interface RecognitionLoadingProps {
  message?: string;
}

export function RecognitionLoading({ message = '正在辨識中...' }: RecognitionLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-muted-foreground text-center">
        AI 正在分析您的食物圖片<br />
        這可能需要幾秒鐘時間
      </p>
    </div>
  );
}
