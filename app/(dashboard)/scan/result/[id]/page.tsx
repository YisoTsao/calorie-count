'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FoodItemCard } from '@/components/scan/food-item-card';
import { NutritionSummary } from '@/components/scan/nutrition-summary';
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

  // 初始化餐別（根據當前時間推測）
  const getDefaultMealType = (): 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'BREAKFAST';
    if (hour >= 11 && hour < 14) return 'LUNCH';
    if (hour >= 17 && hour < 21) return 'DINNER';
    return 'SNACK';
  };
  const [selectedMealType, setSelectedMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER'>(getDefaultMealType);

  // 解析 params
  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  const fetchRecognition = async () => {
    if (!paramId) return;
    
    try {
      const response = await fetch(`/api/recognition/${paramId}`);
      
      if (!response.ok) {
        throw new Error('查詢失敗');
      }

      const data = await response.json();
      setRecognition(data.data.recognition);
      setIsLoading(false);

      // 如果還在處理中，2秒後重新查詢
      if (data.data.recognition.status === 'PROCESSING') {
        setTimeout(fetchRecognition, 2000);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('載入失敗');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      fetchRecognition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]);

  const handleDelete = async (foodId: string) => {
    if (!recognition || !paramId) return;

    const updatedFoods = recognition.foods.filter((f) => f.id !== foodId);
    
    if (updatedFoods.length === 0) {
      alert('至少需要保留一項食物');
      return;
    }

    try {
      const response = await fetch(`/api/recognition/${paramId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foods: updatedFoods }),
      });

      if (!response.ok) {
        throw new Error('更新失敗');
      }

      await fetchRecognition();
    } catch (err) {
      console.error('Delete error:', err);
      alert('刪除失敗');
    }
  };

  const handleSave = async () => {
    if (!recognition || !paramId) return;

    setIsSaving(true);

    const requestBody = {
      mealType: selectedMealType,
      mealDate: new Date().toISOString(),
      foods: recognition.foods.map((food) => ({
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
    };

    console.log('儲存飲食記錄:', requestBody);

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 錯誤:', errorData);
        throw new Error(errorData.error?.message || '儲存失敗');
      }

      // 儲存成功，導向飲食記錄頁面
      router.push('/meals');
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : '儲存失敗，請稍後再試';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || recognition?.status === 'PROCESSING') {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <RecognitionLoading />
      </div>
    );
  }

  if (error || !recognition) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error || '找不到辨識記錄'}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/scan')}
              className="mt-4 mx-auto block"
            >
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
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive mb-4">
              辨識失敗: {recognition.errorMessage || '未知錯誤'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push('/scan')}>
                重新掃描
              </Button>
              <Button onClick={fetchRecognition}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重試
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <Button onClick={handleSave} disabled={isSaving}>
          <Plus className="h-4 w-4 mr-2" />
          {isSaving ? '儲存中...' : '加入今日飲食'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative w-full h-64 mb-4">
            <Image
              src={recognition.imageUrl}
              alt="Food"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          {recognition.confidence !== null && (
            <p className="text-sm text-muted-foreground text-center">
              辨識信心度: {Math.round(recognition.confidence * 100)}%
            </p>
          )}
        </CardContent>
      </Card>

      <NutritionSummary foods={recognition.foods} />

      {/* 餐別選擇 */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-3 text-muted-foreground">加入到</p>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { value: 'BREAKFAST', label: '早餐' },
                { value: 'LUNCH',     label: '午餐' },
                { value: 'DINNER',    label: '晚餐' },
                { value: 'SNACK',     label: '點心' },
                { value: 'OTHER',     label: '其他' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMealType(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedMealType === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">辨識結果</h2>
        {recognition.foods.map((food) => (
          <FoodItemCard
            key={food.id}
            food={food}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
