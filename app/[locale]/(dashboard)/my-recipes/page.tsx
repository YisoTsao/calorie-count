import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MyRecipesClient } from '@/components/kitchen/MyRecipesClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'myRecipes' });
  return { title: t('pageTitle') };
}

export default function MyRecipesPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="mb-6 text-2xl font-bold">個人菜單</h1>
      <MyRecipesClient />
    </div>
  );
}
