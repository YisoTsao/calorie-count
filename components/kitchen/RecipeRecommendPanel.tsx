'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/ai/recipe-recommender';
import type { NutritionGap } from '@/lib/calculations/nutrition-gap';

export function RecipeRecommendPanel() {
  const t = useTranslations('kitchen');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [gap, setGap] = useState<NutritionGap | null>(null);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/kitchen/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 402) {
        toast.error(t('quotaExceeded'));
        return;
      }

      if (res.status === 400) {
        toast.error(t('noIngredientsError'));
        return;
      }

      if (!res.ok) throw new Error('Recommend failed');

      const data = await res.json();
      setRecipes(data.data?.recipes ?? []);
      setGap(data.data?.nutritionGap ?? null);
    } catch {
      toast.error(t('recommendError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipe: Recipe) => {
    try {
      const res = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: recipe.name, data: recipe }),
      });
      if (res.status === 409) {
        toast.info('已在菜單中');
        return;
      }
      if (!res.ok) throw new Error();
      setSavedNames((prev) => new Set(prev).add(recipe.name));
      toast.success('已加入個人菜單');
    } catch {
      toast.error('收藏失敗，請稍後再試');
    }
  };

  const handleSchedule = async (recipe: Recipe, date: Date) => {
    try {
      const res = await fetch('/api/cooking-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName: recipe.name, scheduledDate: date.toISOString() }),
      });
      if (!res.ok) throw new Error();
      toast.success(`已加入 ${date.toLocaleDateString('zh-TW')} 的烹煮計畫`);
    } catch {
      toast.error('排程失敗，請稍後再試');
    }
  };

  return (
    <div className="space-y-4">
      {/* 營養缺口摘要 */}
      {gap && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold">{t('remainingGoals')}</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold">{Math.round(gap.caloriesRemaining)}</div>
                <div className="text-muted-foreground">kcal</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(gap.proteinRemaining)}g</div>
                <div className="text-muted-foreground">{t('protein')}</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(gap.carbsRemaining)}g</div>
                <div className="text-muted-foreground">{t('carbs')}</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(gap.fatRemaining)}g</div>
                <div className="text-muted-foreground">{t('fat')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 推薦按鈕 */}
      <Button onClick={handleRecommend} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        {loading ? t('recommending') : recipes ? t('reRecommend') : t('getRecommendation')}
      </Button>

      {/* 料理清單 */}
      {recipes && recipes.length > 0 && (
        <div className="space-y-3">
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              onSave={handleSave}
              isSaved={savedNames.has(recipe.name)}
              onSchedule={handleSchedule}
            />
          ))}
        </div>
      )}

      {recipes && recipes.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('noRecipes')}
        </p>
      )}
    </div>
  );
}
