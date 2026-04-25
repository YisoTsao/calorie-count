'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  maxProgress: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  streak: 'bg-orange-50 text-orange-800 border-orange-200',
  milestone: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  goal: 'bg-blue-50  text-blue-800  border-blue-200',
};

export default function AchievementWall() {
  const [earned, setEarned] = useState<AchievementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [earnedCount, setEarnedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/achievements');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        const all: AchievementItem[] = json.data?.achievements ?? [];
        setEarned(all.filter((a) => a.earned));
        setEarnedCount(json.data?.earnedCount ?? 0);
        setTotal(json.data?.totalCount ?? 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">成就牆</h3>
        <p className="py-8 text-center text-gray-400">載入中...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">成就牆</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {earnedCount} / {total}
          </span>
          <Link href="/achievements" className="text-sm text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
      </div>

      {earned.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-10 text-center">
          <Trophy className="mx-auto mb-3 h-14 w-14 text-gray-300" />
          <p className="text-sm text-gray-500">尚未獲得任何成就</p>
          <p className="mt-1 text-xs text-gray-400">持續記錄，解鎖更多成就！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {earned.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md ${
                CATEGORY_COLORS[a.category] ?? 'border-gray-200 bg-gray-50 text-gray-800'
              }`}
            >
              <span className="flex-shrink-0 text-2xl">{a.icon}</span>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold">{a.name}</h4>
                <p className="mt-0.5 line-clamp-2 text-xs opacity-75">{a.description}</p>
                {a.earnedAt && (
                  <p className="mt-1 text-xs opacity-50">
                    {new Date(a.earnedAt).toLocaleDateString('zh-TW', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 即將解鎖預覽（進度最高的未獲得成就） */}
    </div>
  );
}
