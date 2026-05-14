'use client';

import { Icon } from '@iconify/react';

interface QuotaInfoModalProps {
  onClose: () => void;
}

const FEATURES = [
  { key: 'conversational_diary', label: '飲食日記對話', icon: 'mdi:chat-outline' },
  { key: 'kitchen_scan',         label: '食材掃描',     icon: 'mdi:camera-outline' },
  { key: 'recipe_recommend',     label: '今日推薦',     icon: 'mdi:chef-hat' },
  { key: 'kitchen_chat',         label: '廚房對話',     icon: 'mdi:fridge-outline' },
] as const;

const QUOTA: Record<string, Record<string, number>> = {
  FREE:    { conversational_diary: 20,  kitchen_scan: 3,  recipe_recommend: 5,  kitchen_chat: 10 },
  PREMIUM: { conversational_diary: 200, kitchen_scan: 30, recipe_recommend: 60, kitchen_chat: 100 },
  PRO:     { conversational_diary: -1,  kitchen_scan: -1, recipe_recommend: -1, kitchen_chat: -1 },
};

const PLAN_STYLE: Record<string, string> = {
  FREE:    'text-slate-300',
  PREMIUM: 'text-blue-400',
  PRO:     'text-yellow-400',
};

function fmt(n: number) {
  return n === -1 ? '無限制' : `${n} 次/月`;
}

export function QuotaInfoModal({ onClose }: QuotaInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:shield-star-outline" className="text-xl text-[#4648d4]" />
            <h2 className="font-semibold text-white">各方案 AI 額度說明</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>

        <div className="p-5">
          {/* Plan header row */}
          <div className="mb-2 grid grid-cols-4 gap-2 px-1">
            <div className="text-xs text-slate-500">功能</div>
            {['FREE', 'PREMIUM', 'PRO'].map((plan) => (
              <div key={plan} className={`text-center text-xs font-semibold ${PLAN_STYLE[plan]}`}>
                {plan}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          <div className="space-y-1">
            {FEATURES.map(({ key, label, icon }) => (
              <div
                key={key}
                className="grid grid-cols-4 gap-2 rounded-xl bg-slate-800/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <Icon icon={icon} className="flex-shrink-0 text-slate-400" />
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
                {['FREE', 'PREMIUM', 'PRO'].map((plan) => (
                  <div key={plan} className="text-center">
                    <span
                      className={`text-xs font-medium ${
                        QUOTA[plan][key] === -1 ? 'text-yellow-400' : 'text-slate-300'
                      }`}
                    >
                      {fmt(QUOTA[plan][key])}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-slate-500">
            ・配額每月 1 日自動重置 &nbsp;・PRO 方案無使用上限
          </p>
        </div>
      </div>
    </div>
  );
}
