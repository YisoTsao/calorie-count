'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { ParsedFood } from '@/lib/ai/food-parser';

interface FoodConfirmCardProps {
  foods: ParsedFood[];
  onEdit?: (index: number, food: ParsedFood) => void;
}

export function FoodConfirmCard({ foods }: FoodConfirmCardProps) {
  const t = useTranslations('aiDiary');

  if (foods.length === 0) return null;

  return (
    <div className="space-y-2">
      {foods.map((food, index) => (
        <Card
          key={index}
          className={`border ${food.confidence < 0.7 ? 'border-yellow-300 bg-yellow-50/50 dark:border-yellow-700 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{food.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {food.portion}
                  </span>
                  {food.isFuzzy && (
                    <Badge variant="outline" className="text-xs text-yellow-600">
                      ⚠️ {t('fuzzyEstimate')}
                    </Badge>
                  )}
                  {food.confidence < 0.7 && (
                    <Badge variant="outline" className="text-xs text-orange-600">
                      {t('lowConfidence')}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
                  <span>{food.calories} kcal</span>
                  <span>P:{food.protein}g</span>
                  <span>C:{food.carbs}g</span>
                  <span>F:{food.fat}g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="rounded-lg bg-muted/50 p-2 text-center text-sm text-muted-foreground">
        {t('totalCalories')}：
        <span className="font-semibold text-foreground">
          {foods.reduce((sum, f) => sum + f.calories, 0)} kcal
        </span>
      </div>
    </div>
  );
}
