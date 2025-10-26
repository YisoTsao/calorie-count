'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface FoodItemCardProps {
  food: {
    id: string;
    name: string;
    nameEn?: string | null;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    confidence?: number | null;
    isEdited: boolean;
  };
  onEdit?: (foodId: string) => void;
  onDelete?: (foodId: string) => void;
  showActions?: boolean;
}

export function FoodItemCard({
  food,
  onEdit,
  onDelete,
  showActions = true,
}: FoodItemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{food.name}</CardTitle>
            {food.nameEn && (
              <p className="text-sm text-muted-foreground">{food.nameEn}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{food.portion}</p>
          </div>
          <div className="flex items-center gap-2">
            {food.isEdited && (
              <Badge variant="outline" className="text-xs">
                已編輯
              </Badge>
            )}
            {food.confidence !== null && food.confidence !== undefined && (
              <Badge
                variant={food.confidence > 0.7 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {Math.round(food.confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">熱量</span>
            <span className="font-semibold">{food.calories} 大卡</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">蛋白質</span>
            <span>{food.protein}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">碳水化合物</span>
            <span>{food.carbs}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">脂肪</span>
            <span>{food.fat}g</span>
          </div>
          {food.fiber !== null && food.fiber !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">膳食纖維</span>
              <span>{food.fiber}g</span>
            </div>
          )}
          {food.sugar !== null && food.sugar !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">糖分</span>
              <span>{food.sugar}g</span>
            </div>
          )}
          {food.sodium !== null && food.sodium !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">鈉</span>
              <span>{food.sodium}mg</span>
            </div>
          )}
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(food.id)}
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                編輯
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(food.id)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                刪除
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
