'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useState } from 'react';
import TrendChart from '@/components/analytics/TrendChart';
import AchievementWall from '@/components/analytics/AchievementWall';
import { TrendingUp, Target, Calendar, Flame } from 'lucide-react';

interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number;
  totalExercise: number;
  weight: number | null;
  allGoalsMet: boolean;
}

interface Summary {
  totalDays: number;
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  avgExercise: number;
  goalsMetDays: number;
  streak: number;
}

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const tc = useTranslations('common');
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const endDate = new Date().toLocaleDateString('en-CA');
        const days = parseInt(period);
        const startDate = new Date(Date.now() - (days - 1) * 86400000).toLocaleDateString('en-CA');
        const response = await fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) throw new Error('載入失敗');
        const data = await response.json();
        setStats(data.stats || []);
        setSummary(data.summary || null);
      } catch (error) {
        console.error('載入統計資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadStats();
  }, [period]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="py-12 text-center text-gray-400">{tc('loading')}</p>
      </div>
    );
  }

  const caloriesData = stats.map((s) => ({
    date: s.date,
    calories: Math.round(s.totalCalories),
  }));

  const nutrientsData = stats.map((s) => ({
    date: s.date,
    protein: Math.round(s.totalProtein),
    carbs: Math.round(s.totalCarbs),
    fat: Math.round(s.totalFat),
  }));

  const waterData = stats.map((s) => ({
    date: s.date,
    water: s.totalWater,
  }));

  const exerciseData = stats.map((s) => ({
    date: s.date,
    exercise: s.totalExercise,
  }));

  const weightData = stats
    .filter((s) => s.weight !== null)
    .map((s) => ({
      date: s.date,
      weight: s.weight!,
    }));

  const goalSuccessRate =
    summary && summary.totalDays > 0
      ? Math.round((summary.goalsMetDays / summary.totalDays) * 100)
      : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
          {(['7', '30', '90'] as const).map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`
                rounded-md px-4 py-2 text-sm font-medium transition-colors
                ${
                  period === days
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {t('daysLabel', { days })}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">{t('avgCalories')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.avgCalories)}</p>
            <p className="mt-1 text-xs text-gray-500">{t('kcalPerDay')}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Target className="text-purple-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">{t('goalsMetDays')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{goalSuccessRate}%</p>
            <p className="mt-1 text-xs text-gray-500">
              {t('goalsMetLabel', { met: summary.goalsMetDays, total: summary.totalDays })}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Flame className="text-orange-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">{t('streak')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.streak}</p>
            <p className="mt-1 text-xs text-gray-500">{t('daysUnit')}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Calendar className="text-green-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">{t('loggedDays')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDays}</p>
            <p className="mt-1 text-xs text-gray-500">{t('daysUnit')}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="mb-8 space-y-6">
        <TrendChart data={caloriesData} type="calories" title={t('caloriesTrend')} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart data={nutrientsData} type="nutrients" title={t('macrosTrend')} />

          {weightData.length > 0 && (
            <TrendChart data={weightData} type="weight" title={t('weightTrend')} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart data={waterData} type="water" title={t('waterTrend')} />

          <TrendChart data={exerciseData} type="exercise" title={t('exerciseTrend')} />
        </div>
      </div>

      {/* Achievement Wall */}
      <AchievementWall />

      {/* Tips */}
      <div className="mt-8 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('recommendations')}</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          {summary && summary.avgCalories > 0 && (
            <>
              {summary.avgCalories > 2500 && (
                <div>
                  <p className="mb-1 font-medium">{t('recCaloriesHigh')}</p>
                  <p className="text-gray-600">
                    {t('recCaloriesHighDesc', { kcal: Math.round(summary.avgCalories) })}
                  </p>
                </div>
              )}

              {summary.avgWater < 1500 && (
                <div>
                  <p className="mb-1 font-medium">{t('recWaterLow')}</p>
                  <p className="text-gray-600">
                    {t('recWaterLowDesc', { ml: Math.round(summary.avgWater) })}
                  </p>
                </div>
              )}

              {summary.avgExercise < 30 && (
                <div>
                  <p className="mb-1 font-medium">{t('recExerciseLow')}</p>
                  <p className="text-gray-600">
                    {t('recExerciseLowDesc', { min: Math.round(summary.avgExercise) })}
                  </p>
                </div>
              )}

              {summary.streak >= 7 && (
                <div>
                  <p className="mb-1 font-medium">{t('recStreak')}</p>
                  <p className="text-gray-600">{t('recStreakDesc', { days: summary.streak })}</p>
                </div>
              )}

              {goalSuccessRate >= 80 && (
                <div>
                  <p className="mb-1 font-medium">{t('recGoals')}</p>
                  <p className="text-gray-600">{t('recGoalsDesc', { pct: goalSuccessRate })}</p>
                </div>
              )}
            </>
          )}

          {(!summary || summary.avgCalories === 0) && (
            <div className="col-span-3 py-4 text-center">
              <p className="text-gray-500">{t('startTracking')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
