'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecognitionLoading } from '@/components/scan/recognition-loading';

interface Recognition {
  id: string;
  imageUrl: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EDITED';
  confidence: number | null;
  errorMessage: string | null;
  foods: Array<{
    id: string;
    name: string;
    nameEn: string | null;
    portion: string;
    portionSize: number;
    portionUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
    confidence: number | null;
    isEdited: boolean;
  }>;
}

const MEAL_OPTIONS = [
  { value: 'BREAKFAST', label: '早餐' },
  { value: 'LUNCH',     label: '午餐' },
  { value: 'DINNER',    label: '晚餐' },
  { value: 'SNACK',     label: '點心' },
  { value: 'OTHER',     label: '其他' },
] as const;

type MealType = (typeof MEAL_OPTIONS)[number]['value'];

const getDefaultMealType = (): MealType => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'BREAKFAST';
  if (h >= 11 && h < 14) return 'LUNCH';
  if (h >= 17 && h < 21) return 'DINNER';
  return 'SNACK';
};

export default function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(getDefaultMealType);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  useEffect(() => {
    if (!paramId) return;

    let timeoutId: NodeJS.Timeout;

    const fetchRecognitionData = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/recognition/${paramId}`);
        if (!response.ok) throw new Error('查詢失敗');
        const data = await response.json();
        const recog = data.data.recognition;
        setRecognition(recog);
        // 初次載入完成時預選所有食物
        if (recog.status === 'COMPLETED' || recog.status === 'EDITED') {
          setSelectedFoodIds(new Set(recog.foods.map((f: { id: string }) => f.id)));
        }
        setIsLoading(false);
        if (recog.status === 'PROCESSING') {
          timeoutId = setTimeout(() => {
            void fetchRecognitionData();
          }, 2000);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('載入失敗');
        setIsLoading(false);
      }
    };

    void fetchRecognitionData();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [paramId]);

  const handleRefresh = useCallback(async () => {
    if (!paramId) return;
    try {
      const response = await fetch(`/api/recognition/${paramId}`);
      if (!response.ok) throw new Error('查詢失敗');
      const data = await response.json();
      setRecognition(data.data.recognition);
      setIsLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('載入失敗');
      setIsLoading(false);
    }
  }, [paramId]);

  const toggleFood = (id: string) => {
    setSelectedFoodIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!recognition) return;
    if (selectedFoodIds.size === recognition.foods.length) {
      setSelectedFoodIds(new Set());
    } else {
      setSelectedFoodIds(new Set(recognition.foods.map((f) => f.id)));
    }
  };

  const handleSave = async () => {
    if (!recognition || !paramId) return;
    if (selectedFoodIds.size === 0) {
      alert('請至少選擇一項食物');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          mealDate: new Date().toISOString(),
          foods: recognition.foods
            .filter((f) => selectedFoodIds.has(f.id))
            .map((food) => ({
              name: food.name,
              nameEn: food.nameEn || undefined,
              portion: food.portion,
              portionSize: food.portionSize,
              portionUnit: food.portionUnit,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              fiber: food.fiber || undefined,
              sugar: food.sugar || undefined,
              sodium: food.sodium || undefined,
              servings: 1,
            })),
          sourceRecognitionId: paramId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '儲存失敗');
      }
      router.push('/meals');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗，請稍後再試';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || recognition?.status === 'PROCESSING') {
    return <RecognitionLoading />;
  }

  if (error || !recognition) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error || '找不到辨識記錄'}</p>
            <Button variant="outline" onClick={() => router.push('/scan')} className="mt-4 mx-auto block">
              返回掃描頁面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recognition.status === 'FAILED') {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />返回
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive mb-4">
              辨識失敗: {recognition.errorMessage || '未知錯誤'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push('/scan')}>重新掃描</Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />重試
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allSelected = selectedFoodIds.size === recognition.foods.length;

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      {/* 頂部返回 */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" />返回
      </Button>

      {/* 食物圖片 */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
        <Image
          src={recognition.imageUrl}
          alt="Food"
          fill
          className="object-cover"
        />
        {recognition.confidence !== null && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              辨識信心度 {Math.round(recognition.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* 食物列表 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">辨識結果</p>
            <p className="text-xs text-gray-500">AI 已辨識出以下食物，請選擇要新增的項目</p>
          </div>
          <button
            onClick={toggleAll}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            {allSelected ? '取消全選' : '全選'}
          </button>
        </div>

        {/* Food items */}
        <div className="divide-y divide-gray-100">
          {recognition.foods.map((food) => {
            const checked = selectedFoodIds.has(food.id);
            return (
              <div
                key={food.id}
                onClick={() => toggleFood(food.id)}
                className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${
                  checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                    checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Food info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{food.name}</p>
                      {food.nameEn && (
                        <p className="text-sm text-gray-500">{food.nameEn}</p>
                      )}
                    </div>
                    {food.confidence != null && (
                      <span className="flex-shrink-0 text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {Math.round(food.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    份量:&nbsp;<span className="text-gray-700">{food.portion}</span>
                    &nbsp;&nbsp;熱量:&nbsp;<span className="font-medium text-gray-900">{food.calories} 卡</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    蛋白質 {food.protein}g&nbsp;&nbsp;碳水 {food.carbs}g&nbsp;&nbsp;脂肪 {food.fat}g
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 餐別選擇 */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
        <p className="text-sm font-medium text-gray-600 mb-2">加入到</p>
        <div className="flex gap-2 flex-wrap">
          {MEAL_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedMealType(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedMealType === value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving || selectedFoodIds.size === 0}
        >
          {isSaving ? '儲存中...' : `+ 新增 ${selectedFoodIds.size} 項食物`}
        </Button>
      </div>
    </div>
  );
}