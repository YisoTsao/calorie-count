'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    section: '主要功能',
    items: [
      { href: '/dashboard', label: '首頁', icon: 'lucide:home' },
      { href: '/scan', label: 'AI 掃描', icon: 'lucide:scan' },
      { href: '/meals', label: '飲食記錄', icon: 'lucide:utensils' },
      { href: '/foods', label: '食物資料庫', icon: 'lucide:search' },
    ],
  },
  {
    section: '數據分析',
    items: [
      { href: '/analytics', label: '趨勢分析', icon: 'lucide:chart-line' },
      { href: '/reports', label: '報表', icon: 'lucide:file-text' },
      { href: '/achievements', label: '成就', icon: 'lucide:trophy' },
    ],
  },
  {
    section: '健康追蹤',
    items: [
      { href: '/nutrition', label: '營養追蹤', icon: 'lucide:activity' },
      { href: '/weight', label: '體重管理', icon: 'lucide:scale' },
      { href: '/exercise', label: '運動記錄', icon: 'lucide:dumbbell' },
    ],
  },
  {
    section: '設定',
    items: [
      { href: '/profile', label: '個人資料', icon: 'lucide:user' },
      { href: '/settings', label: '設定', icon: 'lucide:settings' },
    ],
  },
];

function QuickStats() {
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
          const total = meals.reduce((sum, meal) => sum + meal.foods.reduce((s, f) => s + f.calories, 0), 0);
          setCalories(Math.round(total));
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          const dailyGoal = goalsData.data?.goals?.dailyCalorieGoal;
          if (dailyGoal) setGoal(dailyGoal);
        }
      } catch (error) {
        console.error('載入今日摘要失敗:', error);
      }
    };
    void fetchStats();
  }, []);

  const progress = goal > 0 ? Math.min((calories / goal) * 100, 100) : 0;

  return (
    <div className="mt-auto border-t pt-4 dark:border-gray-800">
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
        <h4 className="text-sm font-semibold mb-2">今日摘要</h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>已攝取</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{calories} kcal</span>
          </div>
          <div className="flex justify-between">
            <span>目標</span>
            <span className="font-semibold">{goal} kcal</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[11px] text-gray-500">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}

function NavContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
      {navItems.map((section) => (
        <div key={section.section} className="mb-4">
          <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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

  return (
    <>
      {/* ── Desktop sidebar (lg+): always visible, fixed left ── */}
      <aside className="hidden lg:flex fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800">
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
              className="fixed right-0 top-0 z-50 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer header with close button */}
              <div className="flex items-center justify-between px-4 py-4 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:apple" className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">CalorieCount</span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="關閉選單"
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
