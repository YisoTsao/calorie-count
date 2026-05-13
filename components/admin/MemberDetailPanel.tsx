'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

type Plan = 'FREE' | 'PREMIUM' | 'PRO';
type Status = 'ACTIVE' | 'TRIALING' | 'CANCELLED' | 'EXPIRED';

interface UsageStat {
  feature: string;
  used: number;
  limit: number;
}

interface DetailData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    updatedAt: string;
  } | null;
  usage: UsageStat[];
}

interface MemberDetailPanelProps {
  userId: string;
  onClose: () => void;
  onSubscriptionUpdated?: () => void;
}

const FEATURE_LABEL: Record<string, string> = {
  conversational_diary: '飲食日記對話',
  kitchen_scan: '食材掃描',
  recipe_recommend: '今日推薦',
  kitchen_chat: '廚房對話',
};

const PLAN_COLOR: Record<string, string> = {
  FREE: 'bg-slate-700 text-slate-300',
  PREMIUM: 'bg-blue-500/20 text-blue-400',
  PRO: 'bg-yellow-500/20 text-yellow-400',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-emerald-400',
  TRIALING: 'text-cyan-400',
  CANCELLED: 'text-red-400',
  EXPIRED: 'text-red-400',
};

const PLAN_OPTIONS: Plan[] = ['FREE', 'PREMIUM', 'PRO'];
const STATUS_OPTIONS: Status[] = ['ACTIVE', 'TRIALING', 'CANCELLED', 'EXPIRED'];

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 100 : limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const barColor =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-[#4648d4]';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-300">
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${isUnlimited ? 20 : pct}%` }}
        />
      </div>
    </div>
  );
}

export function MemberDetailPanel({ userId, onClose, onSubscriptionUpdated }: MemberDetailPanelProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSub, setEditSub] = useState(false);
  const [subPlan, setSubPlan] = useState<Plan>('FREE');
  const [subStatus, setSubStatus] = useState<Status>('ACTIVE');
  const [subPeriodEnd, setSubPeriodEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/members/${userId}`);
    const json = await res.json();
    const detail = json.data as DetailData;
    setData(detail);
    if (detail.subscription) {
      setSubPlan(detail.subscription.plan as Plan);
      setSubStatus(detail.subscription.status as Status);
      setSubPeriodEnd(detail.subscription.currentPeriodEnd.slice(0, 10));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveSub = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: subPlan,
          status: subStatus,
          currentPeriodEnd: new Date(subPeriodEnd).toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('訂閱方案已更新');
      setEditSub(false);
      await load();
      onSubscriptionUpdated?.();
    } catch {
      toast.error('更新失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative mt-2 w-full max-w-sm overflow-y-auto rounded-2xl bg-slate-900/95 shadow-2xl backdrop-blur-xl"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <h2 className="font-semibold text-white">會員詳情</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-800/50" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-5 p-5">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                {data.user.image ? (
                  <Image
                    src={data.user.image}
                    alt={data.user.name ?? ''}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized={data.user.image.includes('?')}
                  />
                ) : (
                  <span className="text-base font-semibold text-slate-300">
                    {(data.user.name ?? data.user.email ?? '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{data.user.name ?? '未命名'}</p>
                <p className="text-xs text-slate-400">{data.user.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  加入：{new Date(data.user.createdAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
            </div>

            {/* Subscription */}
            <div className="rounded-xl bg-slate-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">訂閱方案</span>
                <button
                  onClick={() => setEditSub((v) => !v)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <Icon icon={editSub ? 'mdi:close' : 'mdi:pencil-outline'} className="text-sm" />
                  {editSub ? '取消' : '編輯'}
                </button>
              </div>

              {editSub ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">方案</label>
                    <select
                      value={subPlan}
                      onChange={(e) => setSubPlan(e.target.value as Plan)}
                      className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                    >
                      {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">狀態</label>
                    <select
                      value={subStatus}
                      onChange={(e) => setSubStatus(e.target.value as Status)}
                      className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">到期日</label>
                    <input
                      type="date"
                      value={subPeriodEnd}
                      onChange={(e) => setSubPeriodEnd(e.target.value)}
                      className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                    />
                  </div>
                  <button
                    onClick={handleSaveSub}
                    disabled={saving}
                    className="w-full rounded-lg bg-[#4648d4] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? '儲存中...' : '儲存'}
                  </button>
                </div>
              ) : data.subscription ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_COLOR[data.subscription.plan] ?? 'bg-slate-700 text-slate-300'}`}>
                      {data.subscription.plan}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_COLOR[data.subscription.status] ?? 'text-slate-400'}`}>
                      {data.subscription.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    到期：{new Date(data.subscription.currentPeriodEnd).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">尚無訂閱記錄</p>
              )}
            </div>

            {/* AI Usage */}
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-300">本月 AI 使用量</p>
              <div className="space-y-3">
                {data.usage.map((u) => (
                  <UsageBar
                    key={u.feature}
                    label={FEATURE_LABEL[u.feature] ?? u.feature}
                    used={u.used}
                    limit={u.limit}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">載入失敗</div>
        )}
      </div>
    </div>
  );
}
