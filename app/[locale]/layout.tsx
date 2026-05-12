import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';

/** next-intl locale → Open Graph locale 格式 */
const OG_LOCALE: Record<string, string> = {
  'zh-TW': 'zh_TW',
  en: 'en_US',
  ja: 'ja_JP',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const title = `${t('appName')} | ${t('tagline')}`;
  const description = t('description');

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: `%s | ${t('appName')}`,
    },
    description,
    openGraph: {
      type: 'website',
      siteName: t('appName'),
      locale: OG_LOCALE[locale] ?? locale,
      title,
      description,
      // 統一 OG 圖片設定，涵蓋 Facebook、LINE、Instagram、Google 預覽
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    // X (Twitter) 大圖卡片設定
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/${locale}/opengraph-image`],
    },
    // LINE / Messenger 預覽需要絕對 URL 的 og:image:secure_url（由 metadataBase 解析）
    other: {
      'og:image:secure_url': `${BASE_URL}/${locale}/opengraph-image`,
    },
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
      <body suppressHydrationWarning>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster richColors position="top-center" />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
