'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, RefreshCw, Camera, Loader2 } from 'lucide-react';
import { compressForScan } from '@/lib/client-image-compress';
import { useTranslations, useLocale } from 'next-intl';
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

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'] as const;
type MealType = (typeof MEAL_TYPES)[number];

const getDefaultMealType = (): MealType => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'BREAKFAST';
  if (h >= 11 && h < 14) return 'LUNCH';
  if (h >= 17 && h < 21) return 'DINNER';
  return 'SNACK';
};

export default function ScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const t = useTranslations('scan');
  const tm = useTranslations('meals');
  const tc = useTranslations('common');
  const locale = useLocale();

  const MEAL_OPTIONS = [
    { value: 'BREAKFAST' as MealType, label: tm('types.breakfast') },
    { value: 'LUNCH' as MealType, label: tm('types.lunch') },
    { value: 'DINNER' as MealType, label: tm('types.dinner') },
    { value: 'SNACK' as MealType, label: tm('types.snack') },
    { value: 'OTHER' as MealType, label: tm('other') },
  ];
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** 從 sessionStorage 讀取的本機預覽圖（base64），Supabase 上傳前使用 */
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(getDefaultMealType);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  // 從 sessionStorage 讀取掃描圖預覽
  useEffect(() => {
    if (!paramId) return;
    try {
      const stored = sessionStorage.getItem(`scan-img-${paramId}`);
      if (stored) setPreviewImage(stored);
    } catch {
      // ignore
    }
  }, [paramId]);

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
        setError(tc('error'));
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
      setError(tc('error'));
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !paramId) return;
    setImageError(null);
    setIsImageUploading(true);
    try {
      const compressed = await compressForScan(file);
      const webpFile = new File([compressed], 'scan.webp', { type: 'image/webp' });
      const fd = new FormData();
      fd.append('image', webpFile);
      const res = await fetch(`/api/recognition/${paramId}/image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || t('photoUpdateFailed'));
      const newUrl: string = data.data.imageUrl;
      setRecognition((prev) => prev ? { ...prev, imageUrl: newUrl } : prev);
      setPreviewImage(null); // 已有正式 URL，清除本機預覽
      try { sessionStorage.removeItem(`scan-img-${paramId}`); } catch { /* ignore */ }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('photoUpdateFailed'));
    } finally {
      setIsImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!recognition || !paramId) return;
    if (selectedFoodIds.size === 0) {
      alert(t('minSelectError'));
      return;
    }
    setIsSaving(true);
    try {
      // 使用者確認加入飲食時，才將圖片上傳至 Supabase Storage
      let finalImageUrl = recognition.imageUrl;
      if (!finalImageUrl && previewImage) {
        const blob = await fetch(previewImage).then((r) => r.blob());
        const fd = new FormData();
        fd.append('image', new File([blob], 'scan.webp', { type: 'image/webp' }));
        const imgRes = await fetch(`/api/recognition/${paramId}/image`, {
          method: 'POST',
          body: fd,
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          finalImageUrl = imgData.data.imageUrl;
          setRecognition((prev) =>
            prev ? { ...prev, imageUrl: finalImageUrl ?? '' } : prev
          );
          // 清除 sessionStorage
          try { sessionStorage.removeItem(`scan-img-${paramId}`); } catch { /* ignore */ }
        }
      }
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
        throw new Error(errorData.error?.message || t('saveFailed'));
      }
      router.push('/meals');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('saveFailed');
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
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error || t('notFound')}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/scan')}
              className="mx-auto mt-4 block"
            >
              {t('backToScan')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recognition.status === 'FAILED') {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tc('back')}
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-center text-destructive">
              {t('recognitionFailed')}: {recognition.errorMessage || tc('unknown')}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => router.push('/scan')}>
                {t('rescan')}
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {tc('retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allSelected = selectedFoodIds.size > 0 && selectedFoodIds.size === recognition.foods.length;

  // 辨識完成但未偵測到食物
  if (recognition.status === 'COMPLETED' && recognition.foods.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tc('back')}
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-2 text-lg font-semibold">{t('noFoodsRecognized')}</p>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('noFoodDesc')}
            </p>
            <Button onClick={() => router.push('/scan')}>{t('rescan')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-4 p-4">
      {/* 頂部返回 */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        {tc('back')}
      </Button>

      {/* 食物圖片 */}
      <div
        className="group relative w-full overflow-hidden rounded-2xl bg-gray-100"
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={previewImage ?? (recognition.imageUrl || '/placeholder-food.png')}
          alt="Food"
          fill
          className="object-cover"
          unoptimized={!!(previewImage && previewImage.startsWith('data:'))}
        />
        {recognition.confidence !== null && (
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {t('confidenceLevel')} {Math.round(recognition.confidence * 100)}%
            </span>
          </div>
        )}
        {/* 換圖按鈕 */}
        <button
          type="button"
          onClick={() => !isImageUploading && imageInputRef.current?.click()}
          disabled={isImageUploading}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={t('changePhoto')}
        >
          {isImageUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <>
              <Camera className="h-8 w-8 text-white" />
              <span className="text-sm font-medium text-white">{t('changePhoto')}</span>
            </>
          )}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      {imageError && (
        <p className="-mt-2 text-center text-sm text-red-500">{imageError}</p>
      )}

      {/* 食物列表 */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <p className="font-semibold text-gray-900">{t('result')}</p>
            <p className="text-xs text-gray-500">{t('resultDesc')}</p>
          </div>
          <button onClick={toggleAll} className="text-xs font-medium text-blue-600 hover:underline">
            {allSelected ? t('deselectAll') : t('selectAll')}
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
                className={`flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors ${
                  checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {checked && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Food info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {locale === 'en' ? (food.nameEn || food.name) : food.name}
                      </p>
                      {food.nameEn && (
                        <p className="text-sm text-gray-500">
                          {locale === 'en' ? food.name : food.nameEn}
                        </p>
                      )}
                    </div>
                    {food.confidence != null && (
                      <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600">
                        {Math.round(food.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('servingLabel')}&nbsp;<span className="text-gray-700">{food.portion}</span>
                    &nbsp;&nbsp;{t('caloriesLabel')}&nbsp;
                    <span className="font-medium text-gray-900">{food.calories} {t('caloriesUnit')}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {t('proteinShort')} {food.protein}g&nbsp;&nbsp;{t('carbsShort')} {food.carbs}g&nbsp;&nbsp;{t('fatShort')} {food.fat}g
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 餐別選擇 */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <p className="mb-2 text-sm font-medium text-gray-600">{t('addTo')}</p>
        <div className="flex flex-wrap gap-2">
          {MEAL_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedMealType(value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedMealType === value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex gap-3 pb-4">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>
          {tc('cancel')}
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving || selectedFoodIds.size === 0}
        >
          {isSaving ? tc('saving') : `+ ${t('addSelectedCount', { count: selectedFoodIds.size })}`}
        </Button>
      </div>
    </div>
  );
}
