'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, ChefHat, BookmarkPlus, BookmarkCheck, CalendarPlus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Recipe } from '@/lib/ai/recipe-recommender';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
  onDelete?: () => void;
  onSchedule?: (recipe: Recipe, date: Date) => void;
}

export function RecipeCard({ recipe, onSave, isSaved, onDelete, onSchedule }: RecipeCardProps) {
  const t = useTranslations('kitchen');
  const [showSteps, setShowSteps] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleScheduleConfirm = () => {
    if (!selectedDate) return;
    onSchedule?.(recipe, new Date(selectedDate));
    setScheduleOpen(false);
    setSelectedDate('');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* 標題列 */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{recipe.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.cookTime}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="h-3.5 w-3.5" />
                {recipe.difficulty}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={recipe.matchScore >= 80 ? 'default' : 'secondary'}>
              {t('matchScore')} {recipe.matchScore}%
            </Badge>
            {/* 加入烹煮排程 */}
            {onSchedule && (
              <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="加入烹煮計畫">
                    <CalendarPlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <p className="mb-2 text-sm font-medium">選擇烹煮日</p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                  />
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    disabled={!selectedDate}
                    onClick={handleScheduleConfirm}
                  >
                    確認
                  </Button>
                </PopoverContent>
              </Popover>
            )}
            {/* 收藏 */}
            {onSave && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => !isSaved && onSave(recipe)}
                disabled={isSaved}
                title={isSaved ? '已收藏' : '收藏料理'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-500" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            )}
            {/* 刪除（個人菜單頁使用） */}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
                title="從菜單移除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 營養資訊 */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-md bg-muted p-1.5">
            <div className="font-semibold">{recipe.calories}</div>
            <div className="text-muted-foreground">kcal</div>
          </div>
          <div className="rounded-md bg-muted p-1.5">
            <div className="font-semibold">{recipe.protein}g</div>
            <div className="text-muted-foreground">P</div>
          </div>
          <div className="rounded-md bg-muted p-1.5">
            <div className="font-semibold">{recipe.carbs}g</div>
            <div className="text-muted-foreground">C</div>
          </div>
          <div className="rounded-md bg-muted p-1.5">
            <div className="font-semibold">{recipe.fat}g</div>
            <div className="text-muted-foreground">F</div>
          </div>
        </div>

        {/* 食材標籤 */}
        <div className="mt-3 flex flex-wrap gap-1">
          {recipe.usedIngredients.map((name) => (
            <Badge key={name} variant="outline" className="text-xs text-green-600">
              ✓ {name}
            </Badge>
          ))}
          {recipe.missingIngredients.map((name) => (
            <Badge key={name} variant="outline" className="text-xs text-red-500">
              ✗ {name}
            </Badge>
          ))}
        </div>

        {/* 展開步驟 */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setShowSteps(!showSteps)}
        >
          {showSteps ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" /> {t('hideSteps')}
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" /> {t('viewSteps')}
            </>
          )}
        </Button>

        {showSteps && (
          <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm">
            {recipe.steps.map((step, i) => (
              <li key={i} className="text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
