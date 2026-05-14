import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CookingCalendar } from '@/components/kitchen/CookingCalendar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cookingCalendar' });
  return { title: t('pageTitle') };
}

export default function CookingCalendarPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="mb-6 text-2xl font-bold">烹煮計畫日曆</h1>
      <CookingCalendar />
    </div>
  );
}
