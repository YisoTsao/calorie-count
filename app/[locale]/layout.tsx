import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: `${t('appName')} | ${t('tagline')}`,
      template: `%s | ${t('appName')}`,
    },
    description: t('description'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 驗證 locale 是否有效
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${notoSansTC.variable} font-sans antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
