import { redirect } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

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

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
