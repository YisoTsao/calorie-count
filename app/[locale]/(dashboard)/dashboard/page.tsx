import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { redirect } from '@/i18n/navigation';
import { DashboardClient } from './_client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: `${t('pages.dashboard')} — ${t('appName')}`,
    // 需要登入才能存取，不應被搜尋引擎索引
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: '/login', locale });
  }

  // 從 session 取得使用者名稱（Server Component 直接讀取，不需額外 API 呼叫）
  const userName = session?.user?.name ?? '';

  return <DashboardClient userName={userName} />;
}
