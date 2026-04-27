'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Activity, Scale, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface NutritionSummary {
  water: {
    total: number;
    goal: number;
  };
  exercise: {
    totalCalories: number;
    goal: number;
    count: number;
  };
  weight: {
    current: number | null;
    change: number;
    bmi: number | null;
  };
}

export default function NutritionSummaryCard() {
  const t = useTranslations('nutrition');
  const [data, setData] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 並行請求所有資料
      const [waterRes, exerciseRes, weightRes] = await Promise.all([
        fetch(`/api/water?date=${today}`),
        fetch(`/api/exercise?date=${today}`),
        fetch('/api/weight'),
      ]);

      const waterData = waterRes.ok ? await waterRes.json() : null;
      const exerciseData = exerciseRes.ok ? await exerciseRes.json() : null;
      const weightData = weightRes.ok ? await weightRes.json() : null;

      setData({
        water: {
          total: waterData?.data?.total ?? 0,
          goal: 2000,
        },
        exercise: {
          totalCalories: exerciseData?.data?.totals?.calories ?? 0,
          goal: 300,
          count: exerciseData?.data?.exercises?.length ?? 0,
        },
        weight: {
          current: weightData?.data?.stats?.current ?? null,
          change: weightData?.data?.stats?.change ?? 0,
          bmi: weightData?.data?.stats?.current ?? null,
        },
      });
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const waterProgress = Math.min((data.water.total / data.water.goal) * 100, 100);
  const exerciseProgress = Math.min((data.exercise.totalCalories / data.exercise.goal) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <Link href="/nutrition" className="text-sm text-primary hover:underline">
            {t('viewDetails')}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Water */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Droplet className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">{t('water')}</span>
              <span className="text-sm text-muted-foreground">
                {data.water.total}ml / {data.water.goal}ml
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <Activity className="text-orange-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('exerciseBurn')}{' '}
                {data.exercise.count > 0 && t('exerciseCount', { count: data.exercise.count })}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.exercise.totalCalories)} / {data.exercise.goal} kcal
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                style={{ width: `${exerciseProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <Scale className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('weightLabel')}</span>
              {data.weight.current !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{data.weight.current.toFixed(1)} kg</span>
                  {data.weight.change !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 text-xs ${
                        data.weight.change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {data.weight.change > 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {Math.abs(data.weight.change).toFixed(1)}kg
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{t('noRecord')}</span>
              )}
            </div>
            {data.weight.bmi !== null && (
              <p className="mt-1 text-xs text-muted-foreground">
                BMI: {data.weight.bmi.toFixed(1)}
              </p>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {waterProgress >= 100 ? '✅' : '💧'}
              {waterProgress >= 100 ? ` ${t('waterGoalMet')}` : ` ${t('rememberToHydrate')}`}
            </span>
            <span>
              {exerciseProgress >= 100 ? '🔥' : '🏃'}
              {exerciseProgress >= 100 ? ` ${t('exerciseGoalMet')}` : ` ${t('keepExercising')}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
