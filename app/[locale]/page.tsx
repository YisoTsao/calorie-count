import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingPage } from '@/components/landing/LandingPage';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const tLanding = await getTranslations({ locale, namespace: 'landing.hero' });

  const title = `${t('appName')} — ${t('tagline')}`;
  const description = tLanding('subtitle');
  const ogImageUrl = `/${locale}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'zh-TW': `${BASE_URL}/zh-TW`,
        en: `${BASE_URL}/en`,
        ja: `${BASE_URL}/ja`,
        'x-default': `${BASE_URL}/zh-TW`,
      },
    },
    // Facebook / LINE / Instagram / Google — 使用 og:image
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}`,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    // X (Twitter) 大圖卡片
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    // LINE / Messenger 要求 og:image:secure_url（HTTPS 顯式宣告）
    other: {
      'og:image:secure_url': `${BASE_URL}/${locale}/opengraph-image`,
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // JSON-LD 結構化資料 — 讓 Google 以 WebApplication Rich Result 呈現
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const tHero = await getTranslations({ locale, namespace: 'landing.hero' });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('appName'),
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    url: `${BASE_URL}/${locale}`,
    description: tHero('subtitle'),
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
    },
    featureList: [
      'AI 食物辨識',
      '卡路里計算',
      '營養追蹤',
      '目標設定',
    ],
  };

  // 未登入 → 顯示行銷首頁
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
