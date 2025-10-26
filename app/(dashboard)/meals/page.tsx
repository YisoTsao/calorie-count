'use client';

import { useEffect, useState } from 'react';
import { Plus, Utensils, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

interface MealFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  portion: string;
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

const MEAL_TYPE_LABELS = {
  BREAKFAST: '早餐',
  LUNCH: '午餐',
  DINNER: '晚餐',
  SNACK: '點心',
  OTHER: '其他',
};

export default function MealsPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

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
          acc.calories += food.calories * food.servings;
          acc.protein += food.protein * food.servings;
          acc.carbs += food.carbs * food.servings;
          acc.fat += food.fat * food.servings;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <p className="text-center">載入中...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">飲食記錄</h1>
          <p className="text-muted-foreground mt-1">追蹤您的每日營養攝取</p>
        </div>
        <Button onClick={() => router.push('/scan')}>
          <Plus className="h-4 w-4 mr-2" />
          新增食物
        </Button>
      </div>

      {/* 日期選擇 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label htmlFor="date" className="font-medium">
              選擇日期:
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* 今日營養總計 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>今日總計</CardTitle>
            {!goals && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/goals')}
              >
                <Target className="h-4 w-4 mr-2" />
                設定目標
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 卡路里 */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {Math.round(totals.calories)}
                </p>
                {goals && (
                  <p className="text-xs text-muted-foreground">
                    / {goals.dailyCalorieGoal} kcal
                  </p>
                )}
                <p className="text-sm text-muted-foreground">卡路里</p>
              </div>
              {goals && (
                <Progress
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
                <p className="text-sm text-muted-foreground">蛋白質</p>
              </div>
              {goals && (
                <Progress
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
                  <p className="text-xs text-muted-foreground">
                    / {Math.round(goals.carbsGoal)} g
                  </p>
                )}
                <p className="text-sm text-muted-foreground">碳水化合物</p>
              </div>
              {goals && (
                <Progress
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
                  <p className="text-xs text-muted-foreground">
                    / {Math.round(goals.fatGoal)} g
                  </p>
                )}
                <p className="text-sm text-muted-foreground">脂肪</p>
              </div>
              {goals && (
                <Progress
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
                <p className="text-green-600 dark:text-green-400">
                  ✅ 太棒了！您的攝取接近目標
                </p>
              ) : totals.calories > goals.dailyCalorieGoal * 1.1 ? (
                <p className="text-orange-600 dark:text-orange-400">
                  ⚠️ 今日攝取已超過目標 {Math.round(((totals.calories - goals.dailyCalorieGoal) / goals.dailyCalorieGoal) * 100)}%
                </p>
              ) : (
                <p className="text-muted-foreground">
                  還可以攝取 {Math.round(goals.dailyCalorieGoal - totals.calories)} kcal
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
                <div className="text-sm text-muted-foreground">
                  {Math.round(typeTotals.calories)} kcal
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeMeals.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  尚無記錄
                </p>
              ) : (
                <div className="space-y-4">
                  {typeMeals.map((meal) => (
                    <div key={meal.id} className="space-y-2">
                      {meal.foods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{food.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {food.portion}
                              {food.servings !== 1 && ` × ${food.servings}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {Math.round(food.calories * food.servings)} kcal
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P: {Math.round(food.protein * food.servings)}g | C:{' '}
                              {Math.round(food.carbs * food.servings)}g | F:{' '}
                              {Math.round(food.fat * food.servings)}g
                            </p>
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
    </div>
  );
}
