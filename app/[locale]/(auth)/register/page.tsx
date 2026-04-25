import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.register' });
  return { title: t('title') };
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
