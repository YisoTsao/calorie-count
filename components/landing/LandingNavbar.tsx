'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { Icon } from '@iconify/react';

export function LandingNavbar() {
  const t = useTranslations('landing.nav');
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToFeatures = () => {
    setMenuOpen(false);
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    setMenuOpen(false);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 shadow-sm backdrop-blur-md dark:bg-gray-900/80'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <Icon icon="lucide:apple" className="h-4.5 w-4.5 text-white" style={{ fontSize: 18 }} />
          </div>
          <span className="text-xl font-bold tracking-tight">CalorieCount</span>
        </Link>

        {/* 桌面導覽 */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={scrollToFeatures}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {t('features')}
          </button>
          <button
            onClick={scrollToPricing}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {t('pricing')}
          </button>
          <LocaleSwitcher />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"
          >
            {t('cta')}
          </Link>
        </nav>

        {/* 行動版漢堡按鈕 */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Icon icon={menuOpen ? 'lucide:x' : 'lucide:menu'} className="h-6 w-6" />
        </button>
      </div>

      {/* 行動版全螢幕選單 */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden"
          >
            <nav className="flex flex-col gap-4 px-4 py-6">
              <button
                onClick={scrollToFeatures}
                className="text-left text-base font-medium text-gray-700 dark:text-gray-300"
              >
                {t('features')}
              </button>
              <button
                onClick={scrollToPricing}
                className="text-left text-base font-medium text-gray-700 dark:text-gray-300"
              >
                {t('pricing')}
              </button>
              <div className="py-1">
                <LocaleSwitcher />
              </div>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-gray-700 dark:text-gray-300"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                {t('cta')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
