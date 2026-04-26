'use client';

import { useTranslations } from 'next-intl';
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

export function FoodItemCard({ food, onEdit, onDelete, showActions = true }: FoodItemCardProps) {
  const t = useTranslations('scan');
  const tf = useTranslations('foods');
  const tc = useTranslations('common');
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{food.name}</CardTitle>
            {food.nameEn && <p className="text-sm text-muted-foreground">{food.nameEn}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{food.portion}</p>
          </div>
          <div className="flex items-center gap-2">
            {food.isEdited && (
              <Badge variant="outline" className="text-xs">
                {t('edited')}
              </Badge>
            )}
            {food.confidence !== null && food.confidence !== undefined && (
              <Badge variant={food.confidence > 0.7 ? 'default' : 'secondary'} className="text-xs">
                {Math.round(food.confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tf('caloriesShort')}</span>
            <span className="font-semibold">{food.calories} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tf('proteinShort')}</span>
            <span>{food.protein}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tf('carbsShort')}</span>
            <span>{food.carbs}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tf('fatShort')}</span>
            <span>{food.fat}g</span>
          </div>
          {food.fiber !== null && food.fiber !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{tf('fiber')}</span>
              <span>{food.fiber}g</span>
            </div>
          )}
          {food.sugar !== null && food.sugar !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{tf('sugar')}</span>
              <span>{food.sugar}g</span>
            </div>
          )}
          {food.sodium !== null && food.sodium !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{tf('sodium')}</span>
              <span>{food.sodium}mg</span>
            </div>
          )}
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="mt-4 flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(food.id)}
                className="flex-1"
              >
                <Edit2 className="mr-1 h-4 w-4" />
                {tc('edit')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(food.id)}
                className="flex-1"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {tc('delete')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
