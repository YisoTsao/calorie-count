'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NutritionSummaryProps {
  foods: Array<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  dailyGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export function NutritionSummary({ foods, dailyGoals }: NutritionSummaryProps) {
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getProgress = (current: number, goal?: number) => {
    if (!goal) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>營養總計</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">熱量</span>
            <span className="text-sm">
              {totals.calories.toFixed(0)} {dailyGoals?.calories && `/ ${dailyGoals.calories}`} 大卡
            </span>
          </div>
          {dailyGoals?.calories && (
            <Progress value={getProgress(totals.calories, dailyGoals.calories)} />
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">蛋白質</span>
            <span className="text-sm">
              {totals.protein.toFixed(1)} {dailyGoals?.protein && `/ ${dailyGoals.protein}`}g
            </span>
          </div>
          {dailyGoals?.protein && (
            <Progress
              value={getProgress(totals.protein, dailyGoals.protein)}
              className="[&>div]:bg-blue-500"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">碳水化合物</span>
            <span className="text-sm">
              {totals.carbs.toFixed(1)} {dailyGoals?.carbs && `/ ${dailyGoals.carbs}`}g
            </span>
          </div>
          {dailyGoals?.carbs && (
            <Progress
              value={getProgress(totals.carbs, dailyGoals.carbs)}
              className="[&>div]:bg-yellow-500"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">脂肪</span>
            <span className="text-sm">
              {totals.fat.toFixed(1)} {dailyGoals?.fat && `/ ${dailyGoals.fat}`}g
            </span>
          </div>
          {dailyGoals?.fat && (
            <Progress
              value={getProgress(totals.fat, dailyGoals.fat)}
              className="[&>div]:bg-red-500"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
