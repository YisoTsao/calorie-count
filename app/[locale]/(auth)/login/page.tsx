import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });
  // localePrefix: 'always' — 所有語系均帶前綴，canonical 不能指向無前綴路徑（會 301 redirect）
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/login`,
      languages: {
        'zh-TW': '/zh-TW/login',
        en: '/en/login',
        ja: '/ja/login',
        // x-default 指向預設語系的實際 URL（非 redirect 路徑）
        'x-default': '/zh-TW/login',
      },
    },
  };
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">{t('welcome')}</CardTitle>
          <CardDescription className="text-center">{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
