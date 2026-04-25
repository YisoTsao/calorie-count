'use client';

import { useState, useEffect } from 'react';
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
        throw new Error('更新失敗');
      }

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      alert('更新失敗,請稍後再試');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個食物嗎?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meals/${mealId}/foods?mealFoodId=${mealFood.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除失敗,請稍後再試');
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
          <DialogTitle>編輯食物</DialogTitle>
          <DialogDescription>調整份數或刪除這個食物</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 食物資訊 */}
          <div className="space-y-2">
            <div>
              <p className="text-lg font-medium">{mealFood.name}</p>
              <p className="text-sm text-muted-foreground">
                每份 {mealFood.portionSize / mealFood.servings} {mealFood.portionUnit}
              </p>
            </div>
          </div>

          {/* 份數調整 */}
          <div className="space-y-2">
            <Label htmlFor="servings">份數</Label>
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
              <p className="mb-1 text-xs text-muted-foreground">熱量</p>
              <p className="font-medium">{(baseCalories * servings).toFixed(0)} kcal</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">蛋白質</p>
              <p className="font-medium">{(baseProtein * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">碳水化合物</p>
              <p className="font-medium">{(baseCarbs * servings).toFixed(1)} g</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">脂肪</p>
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
            刪除
          </Button>
          <div className="flex flex-1 gap-2 sm:flex-initial">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating || isDeleting}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || isDeleting} className="flex-1">
              {isUpdating ? '更新中...' : '更新'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
