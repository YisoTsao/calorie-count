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
    <div
      className="min-h-screen bg-slate-950 text-slate-200 flex"
    >
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
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-slate-900/70 backdrop-blur-[12px] border-r border-slate-800/60
          transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo + theme toggle */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center">
            <Icon icon="mdi:shield-crown-outline" className="text-white text-lg" />
          </div>
          <span className="font-['Manrope',sans-serif] font-700 text-white text-sm tracking-wide flex-1">
            Admin Console
          </span>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? '切換亮色主題' : '切換暗色主題'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Icon icon={theme === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'} className="text-lg" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (!hasRole(user.role, item.minRole)) return null;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-[#4648d4]/20 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon
                  icon={item.icon}
                  className={`text-lg flex-shrink-0 ${active ? 'text-[#6063ee]' : ''}`}
                />
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6063ee]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + back link */}
        <div className="p-3 border-t border-slate-800/60 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="text-base" />
            返回主介面
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Icon icon="mdi:logout" className="text-base" />
            登出
          </button>
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <p className="text-xs font-medium text-[#6063ee] mt-0.5">{user.role}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Icon icon="mdi:menu" className="text-xl" />
          </button>
          <span className="font-['Manrope',sans-serif] font-semibold text-white text-sm">
            Admin Console
          </span>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
