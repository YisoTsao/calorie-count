'use client';

import { useEffect, useState } from 'react';
import { Plus, Utensils, Target, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { FoodSearchDialog } from '@/components/meals/FoodSearchDialog';
import { EditMealFoodDialog } from '@/components/meals/EditMealFoodDialog';
import { PhotoUploadDialog } from '@/components/meals/PhotoUploadDialog';
import { RecognitionResultDialog } from '@/components/meals/RecognitionResultDialog';

interface RecognizedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number;
  portionSize: number;
  portionUnit: string;
}

interface MealFood {
  id: string;
  name: string;
  nameEn?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  portion: string;
  portionSize: number;
  portionUnit: string;
}

interface Meal {
  id: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
  mealDate: string;
  foods: MealFood[];
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserGoals {
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export default function MealsPage() {
  const t = useTranslations('meals');
  const tc = useTranslations('common');
  const router = useRouter();

  const MEAL_TYPE_LABELS = {
    BREAKFAST: t('types.breakfast'),
    LUNCH: t('types.lunch'),
    DINNER: t('types.dinner'),
    SNACK: t('types.snack'),
    OTHER: tc('unknown'),
  };
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<Meal['mealType']>('BREAKFAST');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMealFood, setEditingMealFood] = useState<MealFood | null>(null);
  const [editingMealId, setEditingMealId] = useState<string>('');
  const [lastAddedFoodId, setLastAddedFoodId] = useState<string | null>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isRecognitionResultOpen, setIsRecognitionResultOpen] = useState(false);
  const [currentRecognitionId, setCurrentRecognitionId] = useState<string | null>(null);

  const fetchMeals = async () => {
    try {
      const [mealsResponse, goalsResponse] = await Promise.all([
        fetch(`/api/meals?date=${selectedDate}`),
        fetch('/api/goals'),
      ]);

      if (mealsResponse.ok) {
        const mealsData = await mealsResponse.json();
        setMeals(mealsData.data.meals);
        setTotals(mealsData.data.totals);
      }

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.data.goals);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const getMealsByType = (type: Meal['mealType']) => {
    return meals.filter((meal) => meal.mealType === type);
  };

  const calculateMealTotals = (meals: Meal[]) => {
    return meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleOpenSearch = (mealType: Meal['mealType']) => {
    setSelectedMealType(mealType);
    setIsSearchDialogOpen(true);
  };

  const handleAddFood = async (food: { id: string }, servings: number) => {
    setIsAddingFood(true);
    try {
      // First, get or create meal for the selected type and date
      let targetMeal = meals.find(
        (m) => m.mealType === selectedMealType && m.mealDate.startsWith(selectedDate)
      );

      if (!targetMeal) {
        // Create new meal
        const createMealRes = await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealType: selectedMealType,
            mealDate: new Date(selectedDate).toISOString(),
            foods: [],
          }),
        });

        if (!createMealRes.ok) {
          const errorData = await createMealRes.json();
          throw new Error(errorData.error?.message || tc('error'));
        }

        const createMealData = await createMealRes.json();
        targetMeal = createMealData.data.meal;
      }

      if (!targetMeal) {
        throw new Error(tc('error'));
      }

      // Add food to meal
      const addFoodRes = await fetch(`/api/meals/${targetMeal.id}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: food.id,
          servings,
        }),
      });

      if (!addFoodRes.ok) {
        const errorData = await addFoodRes.json();
        throw new Error(errorData.error?.message || '新增食物失敗');
      }

      const addFoodData = await addFoodRes.json();
      const newMealFood = addFoodData.data?.mealFood;

      // 儲存最後新增的食物 ID 和餐次 ID
      if (newMealFood) {
        setLastAddedFoodId(newMealFood.id);
        setEditingMealId(targetMeal.id);
      }

      // Refresh meals data (不關閉 modal,讓使用者可以繼續新增)
      await fetchMeals();
    } catch (error) {
      console.error('Add food error:', error);
      const errorMessage = error instanceof Error ? error.message : tc('error');
      alert(errorMessage);
    } finally {
      setIsAddingFood(false);
    }
  };

  // 新增完成後自動開啟編輯對話框
  const handleAddFoodAndEdit = async (food: { id: string }, servings: number) => {
    await handleAddFood(food, servings);
    // 關閉搜尋對話框
    setIsSearchDialogOpen(false);

    // 等待資料更新後開啟編輯對話框
    setTimeout(() => {
      if (lastAddedFoodId) {
        // 找到剛剛新增的食物
        const meal = meals.find((m) => m.id === editingMealId);
        if (meal) {
          const mealFood = meal.foods.find((f) => f.id === lastAddedFoodId);
          if (mealFood) {
            setEditingMealFood(mealFood);
            setIsEditDialogOpen(true);
          }
        }
      }
    }, 500);
  };

  const handleEditFood = (mealId: string, mealFood: MealFood) => {
    setEditingMealId(mealId);
    setEditingMealFood(mealFood);
    setIsEditDialogOpen(true);
  };

  const handleDeleteFood = async (mealId: string, mealFoodId: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/meals/${mealId}/foods?mealFoodId=${mealFoodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(tc('error'));
      }

      await fetchMeals();
    } catch (error) {
      console.error('Delete error:', error);
      alert(tc('error'));
    }
  };

  // 打開照片上傳對話框
  const handleOpenPhotoUpload = (mealType: Meal['mealType']) => {
    setSelectedMealType(mealType);
    setIsPhotoUploadOpen(true);
  };

  // 照片上傳並辨識完成後
  const handleImageAnalyzed = (recognitionId: string) => {
    setCurrentRecognitionId(recognitionId);
    setIsPhotoUploadOpen(false);
    setIsRecognitionResultOpen(true);
  };

  // 將辨識結果新增到餐點
  const handleAddRecognizedFoods = async (foods: RecognizedFood[]) => {
    // 確保有選擇的餐點類型
    let targetMealId = '';
    const mealsOfType = getMealsByType(selectedMealType);

    if (mealsOfType.length > 0) {
      targetMealId = mealsOfType[0].id;
    } else {
      // 創建新餐點
      try {
        const response = await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealType: selectedMealType,
            mealDate: selectedDate,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          targetMealId = data.data.meal.id;
        }
      } catch (error) {
        console.error('Create meal error:', error);
        alert('建立餐點失敗');
        return;
      }
    }

    // 將辨識的食物批量新增到餐點
    try {
      for (const food of foods) {
        const response = await fetch(`/api/meals/${targetMealId}/foods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodName: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            servings: 1, // 辨識結果的營養值已經是完整份量,所以 servings 設為 1
            portion: `${food.portionSize} ${food.portionUnit}`,
            portionSize: food.portionSize,
            portionUnit: food.portionUnit,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to add food:', food.name, errorData);
        }
      }

      await fetchMeals();
      setIsRecognitionResultOpen(false);
    } catch (error) {
      console.error('Add foods error:', error);
      alert(tc('error'));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        {/* 頁首 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        {/* 日期選擇 */}
        <Skeleton className="h-16 w-full rounded-xl" />
        {/* 今日摘要 */}
        <Skeleton className="h-36 w-full rounded-xl" />
        {/* 餐點卡片 x4 */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/scan')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addFood')}
        </Button>
      </div>

      {/* 日期選擇 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label htmlFor="date" className="font-medium">
              {t('date')}:
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* 今日營養總計 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('dailySummary')}</CardTitle>
            {!goals && (
              <Button variant="outline" size="sm" onClick={() => router.push('/goals')}>
                <Target className="mr-2 h-4 w-4" />
                {t('goals')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* 卡路里 */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{Math.round(totals.calories)}</p>
                {goals && (
                  <p className="text-xs text-muted-foreground">/ {goals.dailyCalorieGoal} kcal</p>
                )}
                <p className="text-sm text-muted-foreground">{t('calories')}</p>
              </div>
              {goals && (
                <Progress
                  key={`calories-${totals.calories}`}
                  value={(totals.calories / goals.dailyCalorieGoal) * 100}
                  className="h-2"
                />
              )}
            </div>

            {/* 蛋白質 */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(totals.protein)}</p>
                {goals && (
                  <p className="text-xs text-muted-foreground">
                    / {Math.round(goals.proteinGoal)} g
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{t('protein')}</p>
              </div>
              {goals && (
                <Progress
                  key={`protein-${totals.protein}`}
                  value={(totals.protein / goals.proteinGoal) * 100}
                  className="h-2"
                />
              )}
            </div>

            {/* 碳水化合物 */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(totals.carbs)}</p>
                {goals && (
                  <p className="text-xs text-muted-foreground">/ {Math.round(goals.carbsGoal)} g</p>
                )}
                <p className="text-sm text-muted-foreground">{t('carbs')}</p>
              </div>
              {goals && (
                <Progress
                  key={`carbs-${totals.carbs}`}
                  value={(totals.carbs / goals.carbsGoal) * 100}
                  className="h-2"
                />
              )}
            </div>

            {/* 脂肪 */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(totals.fat)}</p>
                {goals && (
                  <p className="text-xs text-muted-foreground">/ {Math.round(goals.fatGoal)} g</p>
                )}
                <p className="text-sm text-muted-foreground">{t('fat')}</p>
              </div>
              {goals && (
                <Progress
                  key={`fat-${totals.fat}`}
                  value={(totals.fat / goals.fatGoal) * 100}
                  className="h-2"
                />
              )}
            </div>
          </div>

          {/* 整體進度提示 */}
          {goals && (
            <div className="text-center text-sm">
              {totals.calories >= goals.dailyCalorieGoal * 0.9 &&
              totals.calories <= goals.dailyCalorieGoal * 1.1 ? (
                <p className="text-green-600 dark:text-green-400">✅ {t('statusNearGoal')}</p>
              ) : totals.calories > goals.dailyCalorieGoal * 1.1 ? (
                <p className="text-orange-600 dark:text-orange-400">
                  ⚠️{' '}
                  {t('statusExceeded', {
                    pct: Math.round(
                      ((totals.calories - goals.dailyCalorieGoal) / goals.dailyCalorieGoal) * 100
                    ),
                  })}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {t('statusRemaining', {
                    kcal: Math.round(goals.dailyCalorieGoal - totals.calories),
                  })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 各餐記錄 */}
      {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map((mealType) => {
        const typeMeals = getMealsByType(mealType);
        const typeTotals = calculateMealTotals(typeMeals);

        return (
          <Card key={mealType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  <CardTitle>{MEAL_TYPE_LABELS[mealType]}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {Math.round(typeTotals.calories)} kcal
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPhotoUpload(mealType)}
                    disabled={isAddingFood}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t('takePhoto')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSearch(mealType)}
                    disabled={isAddingFood}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t('addFood')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeMeals.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">{t('noMeals')}</p>
              ) : (
                <div className="space-y-4">
                  {typeMeals.map((meal) => (
                    <div key={meal.id} className="space-y-2">
                      {meal.foods.map((food) => (
                        <div
                          key={food.id}
                          className="group flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{food.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {food.portion}
                              {food.servings !== 1 && ` × ${food.servings}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold">{Math.round(food.calories)} kcal</p>
                              <p className="text-xs text-muted-foreground">
                                P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | F:{' '}
                                {Math.round(food.fat)}g
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFood(meal.id, food)}
                                title={tc('edit')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFood(meal.id, food.id)}
                                title={tc('delete')}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Food Search Dialog */}
      <FoodSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSelectFood={handleAddFood}
        onSelectFoodAndEdit={handleAddFoodAndEdit}
      />

      {/* Edit Meal Food Dialog */}
      <EditMealFoodDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mealFood={editingMealFood}
        mealId={editingMealId}
        onUpdate={fetchMeals}
      />

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        open={isPhotoUploadOpen}
        onOpenChange={setIsPhotoUploadOpen}
        onImageAnalyzed={handleImageAnalyzed}
        mealType={selectedMealType}
      />

      {/* Recognition Result Dialog */}
      <RecognitionResultDialog
        open={isRecognitionResultOpen}
        onOpenChange={setIsRecognitionResultOpen}
        recognitionId={currentRecognitionId}
        onAddToMeal={handleAddRecognizedFoods}
      />
    </div>
  );
}
