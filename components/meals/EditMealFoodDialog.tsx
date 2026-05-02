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
  // 每份（1 serving）的基準值
  const [name, setName] = useState('');
  const [servings, setServings] = useState(1);
  const [caloriesPerServing, setCaloriesPerServing] = useState(0);
  const [proteinPerServing, setProteinPerServing] = useState(0);
  const [carbsPerServing, setCarbsPerServing] = useState(0);
  const [fatPerServing, setFatPerServing] = useState(0);
  const [portionSizePerServing, setPortionSizePerServing] = useState(0);
  const [portionUnit, setPortionUnit] = useState('g');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('meals');
  const tc = useTranslations('common');
  const locale = useLocale();

  const getLocalizedName = (mf: MealFood) => {
    if (locale === 'en') return mf.nameEn || mf.name;
    return mf.name;
  };

  // 每次打開時重置為原始值（轉換為每份基準）
  useEffect(() => {
    if (open && mealFood) {
      const s = mealFood.servings;
      setName(getLocalizedName(mealFood));
      setServings(s);
      setCaloriesPerServing(+(mealFood.calories / s).toFixed(2));
      setProteinPerServing(+(mealFood.protein / s).toFixed(2));
      setCarbsPerServing(+(mealFood.carbs / s).toFixed(2));
      setFatPerServing(+(mealFood.fat / s).toFixed(2));
      setPortionSizePerServing(+(mealFood.portionSize / s).toFixed(2));
      setPortionUnit(mealFood.portionUnit);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mealFood]);

  if (!mealFood) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/meals/${mealId}/foods/${mealFood.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servings,
          name,
          calories: caloriesPerServing,
          protein: proteinPerServing,
          carbs: carbsPerServing,
          fat: fatPerServing,
          portionSize: portionSizePerServing,
          portionUnit,
        }),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('editFood')}</DialogTitle>
          <DialogDescription>{t('editFoodDialogDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 食物名稱 */}
          <div className="space-y-1.5">
            <Label htmlFor="food-name">{t('foodName') || '食物名稱'}</Label>
            <Input
              id="food-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          {/* 份數調整 */}
          <div className="space-y-1.5">
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
              <span className="ml-1 text-sm text-muted-foreground">
                = {(portionSizePerServing * servings).toFixed(0)} {portionUnit}
              </span>
            </div>
          </div>

          {/* 份量單位 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="portion-size">{t('portionSize') || '每份份量'}</Label>
              <div className="flex gap-1.5">
                <Input
                  id="portion-size"
                  type="number"
                  min="0"
                  step="1"
                  value={portionSizePerServing}
                  onChange={(e) =>
                    setPortionSizePerServing(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  disabled={isUpdating}
                />
                <Input
                  value={portionUnit}
                  onChange={(e) => setPortionUnit(e.target.value)}
                  className="w-16"
                  placeholder="g"
                  disabled={isUpdating}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calories-ps">{t('calories')} (kcal/份)</Label>
              <Input
                id="calories-ps"
                type="number"
                min="0"
                step="1"
                value={caloriesPerServing}
                onChange={(e) =>
                  setCaloriesPerServing(Math.max(0, parseFloat(e.target.value) || 0))
                }
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* 三大營養素 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="protein-ps">{t('protein')} (g/份)</Label>
              <Input
                id="protein-ps"
                type="number"
                min="0"
                step="0.1"
                value={proteinPerServing}
                onChange={(e) =>
                  setProteinPerServing(Math.max(0, parseFloat(e.target.value) || 0))
                }
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carbs-ps">{t('carbs')} (g/份)</Label>
              <Input
                id="carbs-ps"
                type="number"
                min="0"
                step="0.1"
                value={carbsPerServing}
                onChange={(e) => setCarbsPerServing(Math.max(0, parseFloat(e.target.value) || 0))}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fat-ps">{t('fat')} (g/份)</Label>
              <Input
                id="fat-ps"
                type="number"
                min="0"
                step="0.1"
                value={fatPerServing}
                onChange={(e) => setFatPerServing(Math.max(0, parseFloat(e.target.value) || 0))}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* 總計預覽 */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('calories')} 合計</p>
              <p className="font-medium">{(caloriesPerServing * servings).toFixed(0)} kcal</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('protein')} 合計</p>
              <p className="font-medium">{(proteinPerServing * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('carbs')} 合計</p>
              <p className="font-medium">{(carbsPerServing * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{t('fat')} 合計</p>
              <p className="font-medium">{(fatPerServing * servings).toFixed(1)} g</p>
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


