import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ConversationalDiaryPanel } from '@/components/ai-diary/ConversationalDiaryPanel';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiDiary' });
  return { title: t('pageTitle') };
}

export default function AiDiaryPage() {
  return (
    <div className="p-4 lg:p-6">
      <ConversationalDiaryPanel />
    </div>
  );
}
