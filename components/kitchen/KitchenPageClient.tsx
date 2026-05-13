'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KitchenScanPanel } from './KitchenScanPanel';
import { RecipeRecommendPanel } from './RecipeRecommendPanel';

export function KitchenPageClient() {
  const t = useTranslations('kitchen');

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{t('pageTitle')}</h1>
      <Tabs defaultValue="scan">
        <TabsList className="w-full">
          <TabsTrigger value="scan" className="flex-1">
            {t('tabScan')}
          </TabsTrigger>
          <TabsTrigger value="recommend" className="flex-1">
            {t('tabRecommend')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scan" className="mt-4">
          <KitchenScanPanel />
        </TabsContent>
        <TabsContent value="recommend" className="mt-4">
          <RecipeRecommendPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
