'use client';

import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
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
  const t = useTranslations('scan');
  const tFoods = useTranslations('foods');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const getLocalizedName = (name: string, nameEn?: string | null, nameJa?: string | null) => {
    if (locale === 'ja') return nameJa || nameEn || name;
    if (locale === 'en') return nameEn || name;
    return name;
  };

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
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>{t('result')}</DialogTitle>
          <DialogDescription>{t('resultDesc')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* 圖片預覽 */}
          {recognition?.imageUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
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
            <div className="flex flex-col items-center justify-center gap-6 py-10">
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
              <div className="relative h-36 w-36 rounded bg-black/5">
                <div className="absolute left-0 top-0 h-7 w-7 rounded-tl border-l-[3px] border-t-[3px] border-green-500" />
                <div className="absolute right-0 top-0 h-7 w-7 rounded-tr border-r-[3px] border-t-[3px] border-green-500" />
                <div className="absolute bottom-0 left-0 h-7 w-7 rounded-bl border-b-[3px] border-l-[3px] border-green-500" />
                <div className="absolute bottom-0 right-0 h-7 w-7 rounded-br border-b-[3px] border-r-[3px] border-green-500" />
                <div className="absolute inset-0 rounded border border-green-500/15" />
                <div className="scan-line-modal" />
              </div>
              <div className="space-y-1 text-center">
                <p className="animate-pulse font-semibold tracking-widest text-green-600">
                  {t('analyzing')}
                </p>
                <p className="text-sm text-muted-foreground">{t('analyzingDesc')}</p>
              </div>
            </div>
          ) : null}

          {/* 失敗 */}
          {recognition?.status === 'FAILED' && (
            <div className="py-12 text-center">
              <p className="mb-2 text-destructive">{t('recognitionFailed')}</p>
              <p className="text-sm text-muted-foreground">
                {recognition.errorMessage || t('retryLater')}
              </p>
            </div>
          )}

          {/* 辨識結果 */}
          {recognition?.status === 'COMPLETED' && (
            <div className="space-y-3">
              {recognition.confidence !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('confidenceLevel')}</span>
                  <Badge variant="secondary">{Math.round(recognition.confidence * 100)}%</Badge>
                </div>
              )}

              <div className="space-y-2">
                {recognition.foods.map((food) => (
                  <Card
                    key={food.id}
                    className={`cursor-pointer p-4 transition-colors ${
                      selectedFoods.has(food.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleFoodSelection(food.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedFoods.has(food.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedFoods.has(food.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium">
                              {getLocalizedName(food.name, food.nameEn)}
                            </h4>
                            {locale === 'en' || locale === 'ja'
                              ? food.name !== getLocalizedName(food.name, food.nameEn) && (
                                  <p className="text-sm text-muted-foreground">{food.name}</p>
                                )
                              : food.nameEn && (
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
                            <span className="text-muted-foreground">{t('servingLabel')}</span>{' '}
                            <span className="font-medium">
                              {food.portion} {food.portionUnit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('caloriesLabel')}</span>{' '}
                            <span className="font-medium">{food.calories} kcal</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {tFoods('proteinShort')} {food.protein}g
                          </span>
                          <span>
                            {tFoods('carbsShort')} {food.carbs}g
                          </span>
                          <span>
                            {tFoods('fatShort')} {food.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {recognition.foods.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t('noFoodsRecognized')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {recognition?.status === 'COMPLETED' && recognition.foods.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleAddToMeal} disabled={selectedFoods.size === 0}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addSelectedCount', { count: selectedFoods.size })}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
