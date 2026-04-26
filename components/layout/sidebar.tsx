'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function useNavItems() {
  const t = useTranslations('nav');
  return [
    {
      section: t('sections.main'),
      items: [
        { href: '/dashboard', label: t('dashboard'), icon: 'lucide:home' },
        { href: '/scan', label: t('scan'), icon: 'lucide:scan' },
        { href: '/meals', label: t('meals'), icon: 'lucide:utensils' },
        { href: '/foods', label: t('foods'), icon: 'lucide:search' },
      ],
    },
    {
      section: t('sections.analytics'),
      items: [
        { href: '/analytics', label: t('analytics'), icon: 'lucide:chart-line' },
        { href: '/reports', label: t('reports'), icon: 'lucide:file-text' },
        { href: '/achievements', label: t('achievements'), icon: 'lucide:trophy' },
      ],
    },
    {
      section: t('sections.health'),
      items: [
        { href: '/nutrition', label: t('nutrition'), icon: 'lucide:activity' },
        { href: '/weight', label: t('weight'), icon: 'lucide:scale' },
        { href: '/exercise', label: t('exercise'), icon: 'lucide:dumbbell' },
      ],
    },
    {
      section: t('sections.settings'),
      items: [
        { href: '/profile', label: t('profile'), icon: 'lucide:user' },
        { href: '/settings', label: t('settings'), icon: 'lucide:settings' },
      ],
    },
  ];
}

function QuickStats() {
  const t = useTranslations('nav');
  const [calories, setCalories] = useState(0);
  const [goal, setGoal] = useState(2000);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [mealsRes, goalsRes] = await Promise.all([
          fetch(`/api/meals?startDate=${today}&endDate=${today}`),
          fetch('/api/goals'),
        ]);

        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();
          const meals: Array<{ foods: Array<{ calories: number }> }> = mealsData.data?.meals ?? [];
          const total = meals.reduce(
            (sum, meal) => sum + meal.foods.reduce((s, f) => s + f.calories, 0),
            0
          );
          setCalories(Math.round(total));
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          const dailyGoal = goalsData.data?.goals?.dailyCalorieGoal;
          if (dailyGoal) setGoal(dailyGoal);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    void fetchStats();
  }, []);

  const progress = goal > 0 ? Math.min((calories / goal) * 100, 100) : 0;

  return (
    <div className="mt-auto border-t pt-4 dark:border-gray-800">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
        <h4 className="mb-2 text-sm font-semibold">{t('todaySummary')}</h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>{t('consumed')}</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{calories} kcal</span>
          </div>
          <div className="flex justify-between">
            <span>{t('goal')}</span>
            <span className="font-semibold">{goal} kcal</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[11px] text-gray-500">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}

function NavContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const navItems = useNavItems();
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
      {navItems.map((section) => (
        <div key={section.section} className="mb-4">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {section.section}
          </h3>
          <nav className="flex flex-col gap-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon icon={item.icon} className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      {/* Quick Stats */}
      <QuickStats />
    </div>
  );
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('common');

  return (
    <>
      {/* ── Desktop sidebar (lg+): always visible, fixed left ── */}
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex">
        <NavContent pathname={pathname} />
      </aside>

      {/* ── Mobile / Tablet drawer: slides in from the right ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onClose}
            />

            {/* Drawer panel – slides from right to left */}
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl dark:bg-gray-900 lg:hidden"
            >
              {/* Drawer header with close button */}
              <div className="flex items-center justify-between border-b px-4 py-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:apple" className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">CalorieCount</span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={t('close')}
                >
                  <Icon icon="lucide:x" className="h-5 w-5" />
                </button>
              </div>

              {/* Nav content */}
              <div className="flex-1 overflow-y-auto">
                <NavContent pathname={pathname} onClose={onClose} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
