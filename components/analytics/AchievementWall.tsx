'use client';

import { useEffect, useState } from 'react';
import { Trophy, Lock } from 'lucide-react';
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
  streak:    'bg-orange-50 text-orange-800 border-orange-200',
  milestone: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  goal:      'bg-blue-50  text-blue-800  border-blue-200',
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 成就牆</h3>
        <p className="text-center text-gray-400 py-8">載入中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🏆 成就牆</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{earnedCount} / {total}</span>
          <Link href="/achievements" className="text-sm text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
      </div>

      {earned.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Trophy className="h-14 w-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">尚未獲得任何成就</p>
          <p className="text-xs text-gray-400 mt-1">持續記錄，解鎖更多成就！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {earned.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border p-3 flex items-start gap-3 hover:shadow-md transition-shadow ${
                CATEGORY_COLORS[a.category] ?? 'bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{a.icon}</span>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{a.name}</h4>
                <p className="text-xs opacity-75 mt-0.5 line-clamp-2">{a.description}</p>
                {a.earnedAt && (
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(a.earnedAt).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', year: 'numeric' })}
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
