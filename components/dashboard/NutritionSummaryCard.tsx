'use client';

import { useEffect, useState } from 'react';
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
        fetch('/api/weight')
      ]);

      const waterData = waterRes.ok ? await waterRes.json() : { total: 0 };
      const exerciseData = exerciseRes.ok ? await exerciseRes.json() : { totalCalories: 0, records: [] };
      const weightData = weightRes.ok ? await weightRes.json() : { stats: null };

      setData({
        water: {
          total: waterData.total || 0,
          goal: 2000
        },
        exercise: {
          totalCalories: exerciseData.totalCalories || 0,
          goal: 300,
          count: exerciseData.records?.length || 0
        },
        weight: {
          current: weightData.stats?.current || null,
          change: weightData.stats?.change || 0,
          bmi: weightData.stats?.current || null
        }
      });
    } catch (error) {
      console.error('載入營養摘要失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>營養追蹤</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">載入中...</p>
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
          <CardTitle>營養追蹤</CardTitle>
          <Link 
            href="/nutrition" 
            className="text-sm text-primary hover:underline"
          >
            查看詳情
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 飲水量 */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Droplet className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">飲水量</span>
              <span className="text-sm text-muted-foreground">
                {data.water.total}ml / {data.water.goal}ml
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 運動消耗 */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Activity className="text-orange-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                運動消耗 {data.exercise.count > 0 && `(${data.exercise.count}筆)`}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.exercise.totalCalories)} / {data.exercise.goal} 卡
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${exerciseProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 體重 */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Scale className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">體重</span>
              {data.weight.current !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {data.weight.current.toFixed(1)} kg
                  </span>
                  {data.weight.change !== 0 && (
                    <span className={`text-xs flex items-center gap-0.5 ${
                      data.weight.change > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
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
                <span className="text-sm text-muted-foreground">尚未記錄</span>
              )}
            </div>
            {data.weight.bmi !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                BMI: {data.weight.bmi.toFixed(1)}
              </p>
            )}
          </div>
        </div>

        {/* 快速提示 */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {waterProgress >= 100 ? '✅' : '💧'} 
              {waterProgress >= 100 ? ' 飲水目標達成' : ' 記得多喝水'}
            </span>
            <span>
              {exerciseProgress >= 100 ? '🔥' : '🏃'} 
              {exerciseProgress >= 100 ? ' 運動目標達成' : ' 保持運動'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
