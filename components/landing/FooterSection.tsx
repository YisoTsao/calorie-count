import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CaloLogo } from '@/components/ui/CaloLogo';

/** FooterSection — Server Component */
export async function FooterSection() {
  const t = await getTranslations('landing.footer');

  return (
    <footer className="border-t bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo + tagline */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <CaloLogo size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold">CalorieCount</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('tagline')}</p>

          {/* 連結 */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {t('links.privacy')}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {t('links.terms')}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-600">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
