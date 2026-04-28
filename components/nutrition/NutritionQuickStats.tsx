'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface QuickStats {
  waterMl: number | null;
  exerciseKcal: number | null;
  weightKg: number | null;
}

export default function NutritionQuickStats() {
  const t = useTranslations('nutrition');
  const [stats, setStats] = useState<QuickStats>({
    waterMl: null,
    exerciseKcal: null,
    weightKg: null,
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.allSettled([
      fetch(`/api/water?date=${today}`).then((r) => r.json()),
      fetch(`/api/exercise?date=${today}`).then((r) => r.json()),
      fetch('/api/weight?limit=1').then((r) => r.json()),
    ]).then(([waterRes, exerciseRes, weightRes]) => {
      setStats({
        waterMl: waterRes.status === 'fulfilled' ? (waterRes.value?.data?.total ?? 0) : 0,
        exerciseKcal:
          exerciseRes.status === 'fulfilled'
            ? Math.round(exerciseRes.value?.data?.totals?.calories ?? 0)
            : 0,
        weightKg:
          weightRes.status === 'fulfilled' ? (weightRes.value?.data?.stats?.current ?? null) : null,
      });
    });
  }, []);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* 今日飲水 */}
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-blue-100">{t('todayWater')}</p>
            <p className="text-3xl font-bold">
              {stats.waterMl === null ? '—' : `${stats.waterMl} ml`}
            </p>
          </div>
          <div className="rounded-full bg-white/20 p-3">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 今日消耗 */}
      <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-orange-100">{t('todayBurn')}</p>
            <p className="text-3xl font-bold">
              {stats.exerciseKcal === null ? '—' : `${stats.exerciseKcal} ${t('kcal')}`}
            </p>
          </div>
          <div className="rounded-full bg-white/20 p-3">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 目前體重 */}
      <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-purple-100">{t('currentWeight')}</p>
            <p className="text-3xl font-bold">
              {stats.weightKg === null ? '—' : `${stats.weightKg} kg`}
            </p>
          </div>
          <div className="rounded-full bg-white/20 p-3">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
