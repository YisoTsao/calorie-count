'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  systemFoods: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  }[];
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'text-red-400 bg-red-500/10',
  EDITOR: 'text-yellow-400 bg-yellow-500/10',
  SUPPORT: 'text-blue-400 bg-blue-500/10',
  USER: 'text-slate-400 bg-slate-800',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: '總會員數',
          value: stats.totalUsers,
          icon: 'mdi:account-multiple-outline',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          label: '啟用中',
          value: stats.activeUsers,
          icon: 'mdi:account-check-outline',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          label: '系統食物',
          value: stats.systemFoods,
          icon: 'mdi:food-apple-outline',
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">總覽</h1>
        <p className="mt-1 text-sm text-slate-400">系統使用狀況一覽</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl bg-slate-900/60 p-5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon icon={card.icon} className={`text-2xl ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{card.label}</p>
                <p className="font-['Manrope',sans-serif] text-3xl font-bold text-white">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/members"
          className="group flex items-center gap-4 rounded-2xl bg-slate-900/60 p-5 transition-colors hover:bg-slate-800/70"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#4648d4]/20">
            <Icon icon="mdi:account-group-outline" className="text-xl text-[#6063ee]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">會員管理</p>
            <p className="mt-0.5 text-xs text-slate-400">查看、編輯角色與狀態</p>
          </div>
          <Icon
            icon="mdi:chevron-right"
            className="text-slate-600 transition-colors group-hover:text-slate-400"
          />
        </Link>
        <Link
          href="/admin/foods"
          className="group flex items-center gap-4 rounded-2xl bg-slate-900/60 p-5 transition-colors hover:bg-slate-800/70"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <Icon icon="mdi:food-apple-outline" className="text-xl text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">食物資料庫</p>
            <p className="mt-0.5 text-xs text-slate-400">管理系統食物與日文名稱</p>
          </div>
          <Icon
            icon="mdi:chevron-right"
            className="text-slate-600 transition-colors group-hover:text-slate-400"
          />
        </Link>
      </div>

      {/* Recent users */}
      {stats && stats.recentUsers.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-4">
            <h2 className="font-['Manrope',sans-serif] text-sm font-semibold text-white">
              最新註冊
            </h2>
            <Link
              href="/admin/members"
              className="text-xs text-[#6063ee] transition-colors hover:text-[#8083f0]"
            >
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-slate-800/40">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700">
                  <span className="text-xs font-medium text-slate-300">
                    {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{u.name ?? '未命名'}</p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role] ?? ROLE_COLOR.USER}`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
