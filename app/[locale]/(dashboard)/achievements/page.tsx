'use client';

import { useTranslations } from 'next-intl';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Lock, CheckCircle, Flame, Target, Star } from 'lucide-react';

interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  triggerType: string;
  triggerValue: number | null;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  maxProgress: number;
}

interface AchievementData {
  achievements: AchievementItem[];
  stats: {
    totalMeals: number;
    appDays: number;
    currentStreak: number;
    goalHitDays: number;
  };
  earnedCount: number;
  totalCount: number;
}

const CATEGORY_CONFIG: Record<string, { colorClass: string }> = {
  streak:    { colorClass: 'text-orange-500' },
  milestone: { colorClass: 'text-yellow-500' },
  goal:      { colorClass: 'text-blue-500' },
};

const CATEGORY_CARD_COLORS: Record<string, { earned: string; progress: string }> = {
  streak:    { earned: 'bg-orange-50 border-orange-200',  progress: 'bg-orange-500' },
  milestone: { earned: 'bg-yellow-50 border-yellow-200', progress: 'bg-yellow-500' },
  goal:      { earned: 'bg-blue-50 border-blue-200',     progress: 'bg-blue-500'   },
};

type FilterTab = 'all' | 'streak' | 'milestone' | 'goal';

export default function AchievementsPage() {
  const t = useTranslations('achievements');
  const tc = useTranslations('common');
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const loadAchievements = useCallback(async () => {
    try {
      const res = await fetch('/api/achievements');
      if (!res.ok) throw new Error('載入失敗');
      const json = await res.json();
      setData(json.data);
    } catch (error) {
      console.error('載入成就失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">{t('calculating')}</div>
      </div>
    );
  }

  if (!data) return null;

  const { achievements, stats, earnedCount, totalCount } = data;
  const completionPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const filtered = activeTab === 'all' ? achievements : achievements.filter((a) => a.category === activeTab);
  const earned = filtered.filter((a) => a.earned);
  const unearned = filtered.filter((a) => !a.earned);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('earnedCount', { earned: earnedCount, total: totalCount, pct: completionPct })}
        </p>
      </div>

      {/* 總進度 */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{t('overallProgress')}</span>
          <span className="text-sm font-bold text-primary">{completionPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-500">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">{t('currentStreak')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{stats.totalMeals}</div>
            <div className="text-xs text-gray-500">{t('totalMeals')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{stats.goalHitDays}</div>
            <div className="text-xs text-gray-500">{t('goalDays')}</div>
          </div>
        </div>
      </div>

      {/* Tab 篩選 */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(['all', 'streak', 'milestone', 'goal'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
{tab === 'all' ? t('allCategories') : t(`categories.${tab}`)}
          </button>
        ))}
      </div>

      {/* 已獲得 */}
      {earned.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
{t('earned')} ({earned.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earned.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        </section>
      )}

      {/* 未獲得 */}
      {unearned.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Lock className="w-5 h-5 text-gray-400" />
{t('notStarted')} ({unearned.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearned.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        </section>
      )}

      {/* Empty */}
      {earned.length === 0 && unearned.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}

function AchievementCard({ achievement: a }: { achievement: AchievementItem }) {
  const t = useTranslations('achievements');
  const colors = CATEGORY_CARD_COLORS[a.category] ?? { earned: 'bg-gray-50 border-gray-200', progress: 'bg-gray-500' };
  const pct = a.maxProgress > 1 ? Math.round((a.progress / a.maxProgress) * 100) : 0;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        a.earned ? `${colors.earned} shadow-sm` : 'bg-gray-50 border-gray-200 opacity-65'
      }`}
    >
      {a.earned
        ? <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-green-500" />
        : <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-300" />
      }

      <div className="flex items-start gap-3 mb-3 pr-6">
        <span className={`text-3xl flex-shrink-0 ${!a.earned ? 'grayscale' : ''}`}>{a.icon}</span>
        <div>
          <h3 className={`font-semibold text-sm ${a.earned ? '' : 'text-gray-500'}`}>{a.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
        </div>
      </div>

      {/* 進度條 */}
      {a.maxProgress > 1 && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{!a.earned && a.progress > 0 ? t('inProgress') : a.earned ? t('completed') : t('pending')}</span>
            <span>{a.progress} / {a.maxProgress}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${colors.progress}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {a.earned && a.earnedAt && (
        <p className="text-xs text-gray-400 mt-2">
          {new Date(a.earnedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
        </p>
      )}
    </div>
  );
}

