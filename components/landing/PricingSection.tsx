import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

/**
 * PricingSection — Server Component
 * 訂閱方案由後台管理，目前為佔位畫面。
 * /api/pricing/plans 回傳空陣列時顯示「即將推出」。
 */
export async function PricingSection() {
  const t = await getTranslations('landing.pricing');

  return (
    <section
      id="pricing"
      className="bg-gradient-to-br from-emerald-50 to-teal-50 py-24 dark:from-gray-950 dark:to-gray-900"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t('title')}</h2>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{t('subtitle')}</p>

        {/* 訂閱方案即將推出 */}
        <div className="mx-auto mt-16 max-w-md rounded-3xl border border-emerald-200 bg-white p-10 shadow-lg dark:border-emerald-800 dark:bg-gray-900">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            {t('comingSoon')}
          </h3>
          <p className="mb-8 text-gray-500 dark:text-gray-400">{t('comingSoonDesc')}</p>
          <button
            className="w-full rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
            disabled
          >
            {t('notifyMe')}
          </button>
        </div>
      </div>
    </section>
  );
}
