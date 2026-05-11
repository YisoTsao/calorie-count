import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';

/**
 * 依據 localePrefix: 'always' 規則計算 locale 路徑段：
 * - 所有語系均帶 /{locale} 前綴
 */
function getLocaleUrl(locale: Locale, path: string): string {
  return `${BASE_URL}/${locale}${path}`;
}

/** 為每個公開路徑建立完整的 hreflang alternates（含 self-reference + x-default） */
function buildAlternates(path: string): Record<string, string> {
  return Object.fromEntries([
    ...routing.locales.map((l) => [l, getLocaleUrl(l, path)]),
    ['x-default', getLocaleUrl(routing.defaultLocale, path)],
  ]);
}

/** 靜態頁面最後修改日期（避免 new Date() 每次 build 都報 "今天"，誤導爬蟲排程） */
const LAST_MODIFIED = new Date('2026-01-01');

const PUBLIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/register', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/login', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/forgot-password', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // 每個公開路徑 × 所有語系 → 各自包含 hreflang alternates
  const localeEntries: MetadataRoute.Sitemap = PUBLIC_PATHS.flatMap(
    ({ path, priority, changeFrequency }) =>
      routing.locales.map((locale) => ({
        url: getLocaleUrl(locale, path),
        lastModified: LAST_MODIFIED,
        changeFrequency,
        priority,
        alternates: {
          languages: buildAlternates(path),
        },
      }))
  );

  // 非語系靜態頁面 —— /privacy 和 /terms 已 308 redirect 至 /{locale}/privacy|terms
  // 故不再列入 sitemap（避免重複索引），改由 localeEntries 中的對應路徑涵蓋
  const staticEntries: MetadataRoute.Sitemap = [];

  return [...localeEntries, ...staticEntries];
}
