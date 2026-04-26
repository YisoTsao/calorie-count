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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">總覽</h1>
        <p className="text-slate-400 mt-1 text-sm">系統使用狀況一覽</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-slate-900/60 p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon icon={card.icon} className={`text-2xl ${card.color}`} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{card.label}</p>
                <p className="text-3xl font-bold text-white font-['Manrope',sans-serif]">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/members"
          className="flex items-center gap-4 rounded-2xl bg-slate-900/60 p-5 hover:bg-slate-800/70 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#4648d4]/20 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:account-group-outline" className="text-xl text-[#6063ee]" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">會員管理</p>
            <p className="text-slate-400 text-xs mt-0.5">查看、編輯角色與狀態</p>
          </div>
          <Icon
            icon="mdi:chevron-right"
            className="text-slate-600 group-hover:text-slate-400 transition-colors"
          />
        </Link>
        <Link
          href="/admin/foods"
          className="flex items-center gap-4 rounded-2xl bg-slate-900/60 p-5 hover:bg-slate-800/70 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:food-apple-outline" className="text-xl text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">食物資料庫</p>
            <p className="text-slate-400 text-xs mt-0.5">管理系統食物與日文名稱</p>
          </div>
          <Icon
            icon="mdi:chevron-right"
            className="text-slate-600 group-hover:text-slate-400 transition-colors"
          />
        </Link>
      </div>

      {/* Recent users */}
      {stats && stats.recentUsers.length > 0 && (
        <div className="rounded-2xl bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <h2 className="font-['Manrope',sans-serif] font-semibold text-white text-sm">
              最新註冊
            </h2>
            <Link
              href="/admin/members"
              className="text-xs text-[#6063ee] hover:text-[#8083f0] transition-colors"
            >
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-slate-800/40">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-slate-300 font-medium">
                    {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name ?? '未命名'}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role] ?? ROLE_COLOR.USER}`}
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
