'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { Icon } from '@iconify/react';

export function LandingNavbar() {
  const t = useTranslations('landing.nav');
  const locale = useLocale();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // 點擊外部關閉 dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToFeatures = () => {
    setMenuOpen(false);
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    setMenuOpen(false);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?';

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
            <img src="/calo-logo.png" alt="Logo" className='rounded-2xl' />
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

          {isAuthenticated ? (
            /* ── 已登入：頭像 + Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? ''}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                    {initials}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-gray-700 dark:text-gray-200">
                  {user?.name ?? user?.email}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Link
                      href={`/${locale}/profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <Icon icon="lucide:user" className="h-4 w-4 text-gray-400" />
                      {t('myProfile')}
                    </Link>
                    {isAdmin && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Icon icon="lucide:shield" className="h-4 w-4 text-gray-400" />
                        {t('adminPanel')}
                      </Link>
                    )}
                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Icon icon="lucide:log-out" className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── 未登入：登入 + 註冊 ── */
            <>
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
            </>
          )}
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

              {isAuthenticated ? (
                <>
                  {/* 行動版：已登入選項 */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    {user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name ?? ''}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                        {initials}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.name ?? user?.email}
                    </span>
                  </div>
                  <Link
                    href={`/profile`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Icon icon="lucide:user" className="h-4 w-4 text-gray-400" />
                    {t('myProfile')}
                  </Link>
                  {isAdmin && (
                    <Link
                      href={`/${locale}/admin`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Icon icon="lucide:shield" className="h-4 w-4 text-gray-400" />
                      {t('adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="flex items-center gap-2 text-base font-medium text-red-500"
                  >
                    <Icon icon="lucide:log-out" className="h-4 w-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  {/* 行動版：未登入選項 */}
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
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
