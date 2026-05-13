'use client';

import useSWR, { mutate } from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { RecipeCard } from '@/components/kitchen/RecipeCard';
import { Loader2, BookmarkX } from 'lucide-react';
import type { Recipe } from '@/lib/ai/recipe-recommender';

interface SavedRecipe {
  id: string;
  name: string;
  data: Recipe;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data);

export function MyRecipesClient() {
  const t = useTranslations('myRecipes');
  const { data: saved, isLoading } = useSWR<SavedRecipe[]>('/api/recipes/saved', fetcher);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/saved/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      mutate('/api/recipes/saved');
      toast.success(t('deleteSuccess'));
    } catch {
      toast.error(t('deleteError'));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!saved || saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookmarkX className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{t('emptyTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {saved.map((item) => (
        <RecipeCard
          key={item.id}
          recipe={item.data}
          isSaved
          onDelete={() => handleDelete(item.id)}
          onSchedule={handleSchedule}
        />
      ))}
    </div>
  );
}
