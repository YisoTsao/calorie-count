import type { Metadata } from 'next';
import { redirect } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

/**
 * Dashboard 內所有頁面均需要登入，不應被搜尋引擎索引。
 * Layout-level robots 設定會被所有子頁面繼承（除非子頁面自行覆寫）。
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: '/login', locale });
    return null;
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
