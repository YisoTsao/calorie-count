'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
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
          <div className="mt-auto border-t pt-4 dark:border-gray-800">
            <div className="rounded-lg bg-primary/10 p-4">
              <h4 className="text-sm font-semibold mb-2">今日摘要</h4>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>已攝取</span>
                  <span className="font-semibold">0 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>目標</span>
                  <span className="font-semibold">2000 kcal</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
