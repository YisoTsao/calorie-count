'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Apple, Target, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
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

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 計算過去 7 天範圍
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        const startDateStr = startDate.toISOString().split('T')[0];

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
            foods: Array<{ calories: number; protein: number; carbs: number; fat: number }>;
          }> = weeklyData.data?.meals ?? [];

          // 建立 7 天的日期 key 對應 map
          const dailyMap: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dailyMap[d.toISOString().split('T')[0]] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          }

          // 累加每筆 meal 的食物營養素到對應日期
          for (const meal of meals) {
            const dateKey = meal.mealDate.split('T')[0];
            if (!dailyMap[dateKey]) continue;
            for (const food of meal.foods) {
              dailyMap[dateKey].calories += food.calories;
              dailyMap[dateKey].protein  += food.protein;
              dailyMap[dateKey].carbs    += food.carbs;
              dailyMap[dateKey].fat      += food.fat;
            }
          }

          // 今日合計
          const todayNutrition = dailyMap[todayStr];
          if (todayNutrition) {
            setTodayTotals({
              calories: Math.round(todayNutrition.calories),
              protein:  Math.round(todayNutrition.protein),
              carbs:    Math.round(todayNutrition.carbs),
              fat:      Math.round(todayNutrition.fat),
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

  // 取得進度顏色
  const getProgressColor = (current: number, goal: number) => {
    if (!goal) return 'bg-blue-500';
    const percentage = (current / goal) * 100;
    if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
    if (percentage > 110) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  // 取得狀態訊息
  const getStatusMessage = (current: number, goal: number) => {
    if (!goal) return '尚未設定目標';
    const percentage = (current / goal) * 100;
    const diff = Math.abs(current - goal);

    if (percentage >= 90 && percentage <= 110) {
      return '✅ 太棒了！您的攝取接近目標';
    } else if (percentage > 110) {
      return `⚠️ 超過目標 ${Math.round(diff)} kcal`;
    } else {
      return `還可攝取 ${Math.round(diff)} kcal`;
    }
  };

  // 週平均
  const weeklyAverage = weeklyData.length > 0
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
        <p className="text-center">載入中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">儀表板</h1>
          <p className="text-muted-foreground mt-1">追蹤您的每日營養攝取</p>
        </div>
        <Button onClick={() => router.push('/scan')} size="lg">
          <Camera className="mr-2 h-5 w-5" />
          快速掃描
        </Button>
      </div>

      {/* 快捷操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push('/scan')}
        >
          <CardContent className="p-6 text-center">
            <Camera className="h-10 w-10 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">掃描食物</h3>
            <p className="text-sm text-muted-foreground mt-1">AI 辨識</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push('/meals')}
        >
          <CardContent className="p-6 text-center">
            <Apple className="h-10 w-10 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">飲食記錄</h3>
            <p className="text-sm text-muted-foreground mt-1">查看記錄</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push('/nutrition')}
        >
          <CardContent className="p-6 text-center">
            <Activity className="h-10 w-10 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">營養追蹤</h3>
            <p className="text-sm text-muted-foreground mt-1">飲水運動</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push('/analytics')}
        >
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">數據分析</h3>
            <p className="text-sm text-muted-foreground mt-1">趨勢報表</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push('/goals')}
        >
          <CardContent className="p-6 text-center">
            <Target className="h-10 w-10 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">目標設定</h3>
            <p className="text-sm text-muted-foreground mt-1">調整目標</p>
          </CardContent>
        </Card>
      </div>

      {/* 今日進度 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 卡路里圓形圖 */}
        <Card>
          <CardHeader>
            <CardTitle>今日卡路里</CardTitle>
            <CardDescription>
              {goals ? `目標 ${goals.dailyCalorieGoal} kcal` : '尚未設定目標'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* SVG 圓形進度 */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
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
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 88 * (1 - getProgress(todayTotals.calories, goals?.dailyCalorieGoal || 2000) / 100)
                  }`}
                  className={getProgressColor(todayTotals.calories, goals?.dailyCalorieGoal || 2000)}
                  strokeLinecap="round"
                />
              </svg>
              {/* 中心文字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold">{todayTotals.calories}</p>
                <p className="text-sm text-muted-foreground">kcal</p>
                <p className="text-sm font-medium mt-1">
                  {Math.round(getProgress(todayTotals.calories, goals?.dailyCalorieGoal || 2000))}%
                </p>
              </div>
            </div>
            <p className="text-sm text-center mt-4 text-muted-foreground">
              {getStatusMessage(todayTotals.calories, goals?.dailyCalorieGoal || 2000)}
            </p>
          </CardContent>
        </Card>

        {/* 營養素進度 */}
        <Card>
          <CardHeader>
            <CardTitle>營養素分配</CardTitle>
            <CardDescription>蛋白質 · 碳水 · 脂肪</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals ? (
              <>
                {/* 蛋白質 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">蛋白質</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.protein}g / {goals.proteinGoal}g
                    </span>
                  </div>
                  <Progress
                    value={getProgress(todayTotals.protein, goals.proteinGoal)}
                    className="h-2"
                  />
                </div>

                {/* 碳水化合物 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">碳水化合物</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.carbs}g / {goals.carbsGoal}g
                    </span>
                  </div>
                  <Progress
                    value={getProgress(todayTotals.carbs, goals.carbsGoal)}
                    className="h-2"
                  />
                </div>

                {/* 脂肪 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">脂肪</span>
                    <span className="text-sm text-muted-foreground">
                      {todayTotals.fat}g / {goals.fatGoal}g
                    </span>
                  </div>
                  <Progress value={getProgress(todayTotals.fat, goals.fatGoal)} className="h-2" />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">尚未設定營養目標</p>
                <button
                  onClick={() => router.push('/goals')}
                  className="mt-2 text-sm text-primary underline-offset-2 hover:underline"
                >
                  前往目標設定 →
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
          <CardTitle>本週趨勢</CardTitle>
          <CardDescription>
            過去 7 天的卡路里攝取 · 平均 {weeklyAverage} kcal/天
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyData.map((day, index) => {
              const date = new Date(day.date);
              const isToday = index === weeklyData.length - 1;
              const dayLabel = `週${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]} ${date.getDate()}日`;

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isToday ? 'font-semibold' : ''}>
                      {dayLabel} {isToday && '(今日)'}
                    </span>
                    <span className="text-muted-foreground">{day.calories} kcal</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isToday ? 'bg-primary' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.min((day.calories / maxCalories) * 100, 100)}%` }}
                    />
                    {/* 目標線 */}
                    {goals && isToday && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-green-500"
                        style={{ left: `${(goals.dailyCalorieGoal / maxCalories) * 100}%` }}
                      >
                        <span className="absolute top-1 left-1 text-xs text-green-600 whitespace-nowrap">
                          目標
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
                {weeklyData[weeklyData.length - 1].calories > weeklyData[weeklyData.length - 2].calories ? (
                  <div className="flex items-center gap-1 text-orange-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>較昨日增加</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>較昨日減少</span>
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
