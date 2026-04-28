'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Apple,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ChevronRight,
  Flame,
  Wheat,
  Droplets,
  Dumbbell,
} from 'lucide-react';
import NutritionSummaryCard from '@/components/dashboard/NutritionSummaryCard';

// 介面定義
interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserGoals {
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

interface WeeklyData {
  date: string;
  calories: number;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [todayTotals, setTodayTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [userName, setUserName] = useState<string>('');

  // 載入使用者名稱
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setUserName(data.data?.name || '');
        }
      } catch {
        /* ignore */
      }
    };
    void fetchUser();
  }, []);

  // 根據時間產生問候語
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return t('greeting.night');
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const todayStr = today.toLocaleDateString('en-CA');

        // 計算過去 7 天範圍
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        const startDateStr = startDate.toLocaleDateString('en-CA');

        // ── 由原本 9 次 API 呼叫（7 天 + 今日 + 目標）合併為 2 次 ──
        // 1. 一次拿到 7 天所有飲食資料（meals API 支援 startDate/endDate）
        // 2. 一次拿目標
        const [weeklyResponse, goalsResponse] = await Promise.all([
          fetch(`/api/meals?startDate=${startDateStr}&endDate=${todayStr}`),
          fetch('/api/goals'),
        ]);

        // 處理 7 天飲食：將 meals 依日期分組，累計每日卡路里
        if (weeklyResponse.ok) {
          const weeklyData = await weeklyResponse.json();
          const meals: Array<{
            mealDate: string;
            foods: Array<{
              calories: number;
              protein: number;
              carbs: number;
              fat: number;
            }>;
          }> = weeklyData.data?.meals ?? [];

          // 建立 7 天的日期 key 對應 map
          const dailyMap: Record<
            string,
            { calories: number; protein: number; carbs: number; fat: number }
          > = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dailyMap[d.toLocaleDateString('en-CA')] = {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            };
          }

          // 累加每筆 meal 的食物營養素到對應日期
          for (const meal of meals) {
            const dateKey = meal.mealDate.split('T')[0];
            if (!dailyMap[dateKey]) continue;
            for (const food of meal.foods) {
              dailyMap[dateKey].calories += food.calories;
              dailyMap[dateKey].protein += food.protein;
              dailyMap[dateKey].carbs += food.carbs;
              dailyMap[dateKey].fat += food.fat;
            }
          }

          // 今日合計
          const todayNutrition = dailyMap[todayStr];
          if (todayNutrition) {
            setTodayTotals({
              calories: Math.round(todayNutrition.calories),
              protein: Math.round(todayNutrition.protein),
              carbs: Math.round(todayNutrition.carbs),
              fat: Math.round(todayNutrition.fat),
            });
          }

          // 週資料（給圖表用）
          setWeeklyData(
            Object.entries(dailyMap).map(([date, v]) => ({
              date,
              calories: Math.round(v.calories),
            }))
          );
        }

        // 處理目標
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData.data.goals);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 計算進度百分比
  const getProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // 取得進度顏色 (hex for SVG stroke)
  const getStrokeColor = (current: number, goal: number) => {
    if (!goal) return '#10b981';
    const percentage = (current / goal) * 100;
    if (percentage >= 90 && percentage <= 110) return '#10b981';
    if (percentage > 110) return '#f97316';
    return '#10b981';
  };

  // 取得狀態訊息
  const getStatusMessage = (current: number, goal: number) => {
    if (!goal) return t('noGoals');
    const percentage = (current / goal) * 100;
    const diff = Math.abs(current - goal);

    if (percentage >= 90 && percentage <= 110) {
      return t('statusNearGoal');
    } else if (percentage > 110) {
      return t('statusExceeded', { diff: Math.round(diff) });
    } else {
      return t('statusRemaining', { diff: Math.round(diff) });
    }
  };

  // 週平均
  const weeklyAverage =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length)
      : 0;

  // 最大值用於圖表比例
  const maxCalories = Math.max(
    ...weeklyData.map((d) => d.calories),
    goals?.dailyCalorieGoal || 2000
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}，{userName || t('greeting.suffix')}！👋
          </h1>
          <p className="mt-1 text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => router.push('/scan')} size="lg">
          <Camera className="mr-2 h-5 w-5" />
          {t('quickScan')}
        </Button>
      </div>

      {/* 快捷操作卡片 */}
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
        {[
          {
            href: '/scan',
            label: t('quickActions.scanFood'),
            desc: t('quickActions.scanFoodDesc'),
            icon: Camera,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
          },
          {
            href: '/meals',
            label: t('quickActions.viewMeals'),
            desc: t('quickActions.viewMealsDesc'),
            icon: Apple,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            href: '/nutrition',
            label: t('quickActions.viewNutrition'),
            desc: t('quickActions.viewNutritionDesc'),
            icon: Activity,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
          {
            href: '/analytics',
            label: t('quickActions.viewAnalytics'),
            desc: t('quickActions.viewAnalyticsDesc'),
            icon: BarChart3,
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
          },
          {
            href: '/goals',
            label: t('quickActions.viewGoals'),
            desc: t('quickActions.viewGoalsDesc'),
            icon: Target,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
        ].map((item) => (
          <Card
            key={item.href}
            className="min-w-[160px] flex-shrink-0 cursor-pointer transition-colors hover:bg-accent"
            onClick={() => router.push(item.href)}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`h-12 w-12 rounded-full ${item.iconBg} flex flex-shrink-0 items-center justify-center`}
              >
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 今日進度 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 卡路里圓形圖 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('calorieProgress')}</CardTitle>
            <CardDescription>
              {goals ? t('calorieGoalLabel', { goal: goals.dailyCalorieGoal }) : t('noGoals')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* SVG 圓形進度 */}
            <div className="relative h-48 w-48">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192">
                {/* 背景圓 */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-200"
                />
                {/* 進度圓 */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={getStrokeColor(todayTotals.calories, goals?.dailyCalorieGoal || 2000)}
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${
                    2 *
                    Math.PI *
                    88 *
                    (1 - getProgress(todayTotals.calories, goals?.dailyCalorieGoal || 2000) / 100)
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              {/* 中心文字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold">{todayTotals.calories}</p>
                <p className="text-sm text-muted-foreground">kcal</p>
                <p className="mt-1 text-sm font-medium">
                  {Math.round((todayTotals.calories / (goals?.dailyCalorieGoal || 2000)) * 100)}%
                </p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {getStatusMessage(todayTotals.calories, goals?.dailyCalorieGoal || 2000)}
            </p>
          </CardContent>
        </Card>

        {/* 營養素進度 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('macros.title')}</CardTitle>
            <CardDescription>{t('macros.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals ? (
              <>
                {/* 蛋白質 */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{t('macros.protein')}</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.protein}g / {goals.proteinGoal}g
                    </span>
                  </div>
                  <Progress
                    value={getProgress(todayTotals.protein, goals.proteinGoal)}
                    className="h-2"
                    indicatorClassName="bg-emerald-600"
                  />
                </div>

                {/* 碳水化合物 */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{t('macros.carbs')}</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.carbs}g / {goals.carbsGoal}g
                    </span>
                  </div>
                  <Progress
                    value={getProgress(todayTotals.carbs, goals.carbsGoal)}
                    className="h-2"
                    indicatorClassName="bg-emerald-400"
                  />
                </div>

                {/* 脂肪 */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{t('macros.fat')}</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.fat}g / {goals.fatGoal}g
                    </span>
                  </div>
                  <Progress
                    value={getProgress(todayTotals.fat, goals.fatGoal)}
                    className="h-2"
                    indicatorClassName="bg-emerald-300"
                  />
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('nutritionGoalNotSet')}</p>
                <button
                  onClick={() => router.push('/goals')}
                  className="mt-2 text-sm text-primary underline-offset-2 hover:underline"
                >
                  {t('goToGoals')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 營養追蹤摘要 */}
        <NutritionSummaryCard />
      </div>

      {/* 本週趨勢 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('weeklyTrend.title')}</CardTitle>
          <CardDescription>{t('weeklyAverageDesc', { avg: weeklyAverage })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyData.map((day, index) => {
              const date = new Date(day.date);
              const isToday = index === weeklyData.length - 1;
              const dayLabel = new Intl.DateTimeFormat(undefined, {
                weekday: 'short',
                day: 'numeric',
              }).format(date);

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isToday ? 'font-semibold' : ''}>
                      {dayLabel} {isToday && `(${t('today')})`}
                    </span>
                    <span className="text-muted-foreground">{day.calories} kcal</span>
                  </div>
                  <div className="relative h-6 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${isToday ? 'bg-blue-600' : 'bg-blue-400'}`}
                      style={{
                        width: `${Math.min((day.calories / maxCalories) * 100, 100)}%`,
                      }}
                    />
                    {/* 目標線 */}
                    {goals && isToday && (
                      <div
                        className="absolute bottom-0 top-0 w-0.5 bg-emerald-500"
                        style={{
                          left: `${(goals.dailyCalorieGoal / maxCalories) * 100}%`,
                        }}
                      >
                        <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {t('weeklyTrend.goalLine')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 趨勢提示 */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {weeklyData.length >= 2 && (
              <>
                {weeklyData[weeklyData.length - 1].calories >
                weeklyData[weeklyData.length - 2].calories ? (
                  <div className="flex items-center gap-1 text-orange-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t('trendUp')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>{t('trendDown')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
