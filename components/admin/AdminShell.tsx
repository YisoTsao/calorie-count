'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import type { UserRole } from '@/lib/rbac';
import { hasRole } from '@/lib/rbac';

interface AdminUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

interface AdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

const navItems = [
  {
    href: '/admin',
    label: '總覽',
    icon: 'mdi:view-dashboard-outline',
    exact: true,
    minRole: 'SUPPORT' as UserRole,
  },
  {
    href: '/admin/members',
    label: '會員管理',
    icon: 'mdi:account-group-outline',
    minRole: 'SUPPORT' as UserRole,
  },
  {
    href: '/admin/foods',
    label: '食物資料庫',
    icon: 'mdi:food-apple-outline',
    minRole: 'SUPPORT' as UserRole,
  },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load persisted theme from localStorage and sync to <html>
  useEffect(() => {
    const saved = localStorage.getItem('admin-theme') as 'dark' | 'light' | null;
    const t = saved === 'light' ? 'light' : 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-admin-theme', t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('admin-theme', next);
    document.documentElement.setAttribute('data-admin-theme', next);
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col
          border-r border-slate-800/60 bg-slate-900/70 backdrop-blur-[12px]
          transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:z-auto lg:translate-x-0
        `}
      >
        {/* Logo + theme toggle */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/60 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4648d4] to-[#6063ee]">
            <Icon icon="mdi:shield-crown-outline" className="text-lg text-white" />
          </div>
          <span className="font-700 flex-1 font-['Manrope',sans-serif] text-sm tracking-wide text-white">
            後台管理
          </span>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? '切換亮色主題' : '切換暗色主題'}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
          >
            <Icon
              icon={theme === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'}
              className="text-lg"
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            if (!hasRole(user.role, item.minRole)) return null;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-[#4648d4]/20 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }
                `}
              >
                <Icon
                  icon={item.icon}
                  className={`flex-shrink-0 text-lg ${active ? 'text-[#6063ee]' : ''}`}
                />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6063ee]" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + back link */}
        <div className="space-y-1 border-t border-slate-800/60 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
          >
            <Icon icon="mdi:arrow-left" className="text-base" />
            返回主介面
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Icon icon="mdi:logout" className="text-base" />
            登出
          </button>
          <div className="px-3 py-2">
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <p className="mt-0.5 text-xs font-medium text-[#6063ee]">{user.role}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-800/60 bg-slate-900/40 px-6 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Icon icon="mdi:menu" className="text-xl" />
          </button>
          <span className="font-['Manrope',sans-serif] text-sm font-semibold text-white">
            後台管理
          </span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
