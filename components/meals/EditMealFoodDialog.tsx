'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

interface EditMealFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealFood: MealFood | null;
  mealId: string;
  onUpdate: () => void;
}

export function EditMealFoodDialog({
  open,
  onOpenChange,
  mealFood,
  mealId,
  onUpdate,
}: EditMealFoodDialogProps) {
  const [servings, setServings] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('meals');
  const tc = useTranslations('common');
  const locale = useLocale();

  const getLocalizedName = (name: string, nameEn?: string | null, nameJa?: string | null) => {
    if (locale === 'ja') return nameJa || nameEn || name;
    if (locale === 'en') return nameEn || name;
    return name;
  };

  // 每次打開對話框時重置為原始值
  useEffect(() => {
    if (open && mealFood) {
      setServings(mealFood.servings);
    }
  }, [open, mealFood]);

  if (!mealFood) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/meals/${mealId}/foods/${mealFood.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servings }),
      });

      if (!response.ok) {
        throw new Error(t('updateFoodFailed'));
      }

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      alert(t('updateFoodFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDeleteFood'))) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meals/${mealId}/foods?mealFoodId=${mealFood.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(t('deleteFoodFailed'));
      }

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert(t('deleteFoodFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const baseCalories = mealFood.calories / mealFood.servings;
  const baseProtein = mealFood.protein / mealFood.servings;
  const baseCarbs = mealFood.carbs / mealFood.servings;
  const baseFat = mealFood.fat / mealFood.servings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('editFood')}</DialogTitle>
          <DialogDescription>{t('editFoodDialogDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 食物資訊 */}
          <div className="space-y-2">
            <div>
              <p className="text-lg font-medium">
                {getLocalizedName(mealFood.name, mealFood.nameEn)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('perServingUnit')} {mealFood.portionSize / mealFood.servings}{' '}
                {mealFood.portionUnit}
              </p>
            </div>
          </div>

          {/* 份數調整 */}
          <div className="space-y-2">
            <Label htmlFor="servings">{t('quantityLabel')}</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                disabled={servings <= 0.5 || isUpdating}
              >
                -
              </Button>
              <Input
                id="servings"
                type="number"
                step="0.5"
                min="0.5"
                value={servings}
                onChange={(e) => setServings(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                className="w-24 text-center"
                disabled={isUpdating}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServings(servings + 0.5)}
                disabled={isUpdating}
              >
                +
              </Button>
              <span className="ml-2 text-sm text-muted-foreground">
                = {((mealFood.portionSize / mealFood.servings) * servings).toFixed(0)}{' '}
                {mealFood.portionUnit}
              </span>
            </div>
          </div>

          {/* 營養資訊預覽 */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('calories')}</p>
              <p className="font-medium">{(baseCalories * servings).toFixed(0)} kcal</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('protein')}</p>
              <p className="font-medium">{(baseProtein * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('carbs')}</p>
              <p className="font-medium">{(baseCarbs * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('fat')}</p>
              <p className="font-medium">{(baseFat * servings).toFixed(1)} g</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="sm:mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tc('delete')}
          </Button>
          <div className="flex flex-1 gap-2 sm:flex-initial">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating || isDeleting}
              className="flex-1"
            >
              {tc('cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || isDeleting} className="flex-1">
              {isUpdating ? t('updatingFood') : tc('update')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
