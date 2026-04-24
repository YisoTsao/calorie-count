'use client';

import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface RecognizedFood {
  id: string;
  name: string;
  nameEn: string | null;
  portion: number;
  portionSize: number;
  portionUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number | null;
}

interface RecognitionData {
  id: string;
  imageUrl: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  confidence: number | null;
  foods: RecognizedFood[];
  errorMessage: string | null;
}

interface RecognitionResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recognitionId: string | null;
  onAddToMeal: (foods: RecognizedFood[]) => void;
}

export function RecognitionResultDialog({
  open,
  onOpenChange,
  recognitionId,
  onAddToMeal,
}: RecognitionResultDialogProps) {
  const [recognition, setRecognition] = useState<RecognitionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());

  const loadRecognition = async () => {
    if (!recognitionId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/recognition/${recognitionId}`);
      if (!response.ok) {
        throw new Error('載入失敗');
      }

      const data = await response.json();
      setRecognition(data.data.recognition);

      // 如果還在處理中,輪詢狀態
      if (data.data.recognition.status === 'PROCESSING') {
        setTimeout(() => loadRecognition(), 2000);
      } else if (data.data.recognition.status === 'COMPLETED') {
        // 預設全選
        setSelectedFoods(new Set(data.data.recognition.foods.map((f: RecognizedFood) => f.id)));
      }
    } catch (error) {
      console.error('載入辨識結果失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recognitionId && open) {
      loadRecognition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognitionId, open]);

  const toggleFoodSelection = (foodId: string) => {
    const newSelected = new Set(selectedFoods);
    if (newSelected.has(foodId)) {
      newSelected.delete(foodId);
    } else {
      newSelected.add(foodId);
    }
    setSelectedFoods(newSelected);
  };

  const handleAddToMeal = () => {
    if (!recognition) return;

    const foodsToAdd = recognition.foods.filter((food) => selectedFoods.has(food.id));
    onAddToMeal(foodsToAdd);
    onOpenChange(false);
  };

  const handleClose = () => {
    setRecognition(null);
    setSelectedFoods(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>辨識結果</DialogTitle>
          <DialogDescription>
            AI 已辨識出以下食物,請選擇要新增的項目
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* 圖片預覽 */}
          {recognition?.imageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
              <Image
                src={recognition.imageUrl}
                alt="Uploaded food"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* 載入中 / 處理中 — 掃描特效 */}
          {(isLoading && !recognition) || recognition?.status === 'PROCESSING' ? (
            <div className="flex flex-col items-center justify-center py-10 gap-6">
              <style>{`
                @keyframes scanMoveModal {
                  0%   { top: 0%; }
                  50%  { top: calc(100% - 2px); }
                  100% { top: 0%; }
                }
                .scan-line-modal {
                  position: absolute;
                  left: 0; right: 0;
                  height: 2px;
                  background: linear-gradient(to right, transparent, #4ade80, transparent);
                  animation: scanMoveModal 1.8s ease-in-out infinite;
                }
              `}</style>
              {/* 掃描角框（Modal 尺寸縮小版） */}
              <div className="relative w-36 h-36 bg-black/5 rounded">
                <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-green-500 rounded-tl" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-green-500 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-green-500 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-green-500 rounded-br" />
                <div className="absolute inset-0 border border-green-500/15 rounded" />
                <div className="scan-line-modal" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-green-600 font-semibold tracking-widest animate-pulse">
                  AI 辨識中...
                </p>
                <p className="text-sm text-muted-foreground">正在分析食物照片，請稍候</p>
              </div>
            </div>
          ) : null}

          {/* 失敗 */}
          {recognition?.status === 'FAILED' && (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">辨識失敗</p>
              <p className="text-sm text-muted-foreground">
                {recognition.errorMessage || '請稍後再試'}
              </p>
            </div>
          )}

          {/* 辨識結果 */}
          {recognition?.status === 'COMPLETED' && (
            <div className="space-y-3">
              {recognition.confidence !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">辨識信心度</span>
                  <Badge variant="secondary">
                    {Math.round(recognition.confidence * 100)}%
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                {recognition.foods.map((food) => (
                  <Card
                    key={food.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedFoods.has(food.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleFoodSelection(food.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${
                          selectedFoods.has(food.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedFoods.has(food.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-medium">{food.name}</h4>
                            {food.nameEn && (
                              <p className="text-sm text-muted-foreground">{food.nameEn}</p>
                            )}
                          </div>
                          {food.confidence !== null && (
                            <Badge variant="outline" className="shrink-0">
                              {Math.round(food.confidence * 100)}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">份量:</span>{' '}
                            <span className="font-medium">
                              {food.portion} {food.portionUnit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">熱量:</span>{' '}
                            <span className="font-medium">{food.calories} 卡</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>蛋白質 {food.protein}g</span>
                          <span>碳水 {food.carbs}g</span>
                          <span>脂肪 {food.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {recognition.foods.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">未辨識到任何食物</p>
                </div>
              )}
            </div>
          )}
        </div>

        {recognition?.status === 'COMPLETED' && recognition.foods.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button
              onClick={handleAddToMeal}
              disabled={selectedFoods.size === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              新增 {selectedFoods.size} 項食物
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
