"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/analytics/TrendChart";
import AchievementWall from "@/components/analytics/AchievementWall";
import { TrendingUp, Target, Calendar, Flame } from "lucide-react";

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
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stats?days=${period}`);
        if (!response.ok) throw new Error("載入失敗");
        const data = await response.json();
        setStats(data.stats || []);
        setSummary(data.summary || null);
      } catch (error) {
        console.error("載入統計資料失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadStats();
  }, [period]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-400 py-12">載入中...</p>
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">數據分析</h1>
          <p className="text-gray-600">追蹤您的健康趨勢與成就</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(["7", "30", "90"] as const).map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  period === days
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {days} 天
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">平均卡路里</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(summary.avgCalories)}
            </p>
            <p className="text-xs text-gray-500 mt-1">kcal/天</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="text-purple-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">目標達成率</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {goalSuccessRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.goalsMetDays}/{summary.totalDays} 天
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="text-orange-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">連續打卡</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.streak}</p>
            <p className="text-xs text-gray-500 mt-1">天</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="text-green-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">記錄天數</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalDays}
            </p>
            <p className="text-xs text-gray-500 mt-1">天</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6 mb-8">
        <TrendChart data={caloriesData} type="calories" title="路里攝取趨勢" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={nutrientsData}
            type="nutrients"
            title="三大營養素趨勢"
          />

          {weightData.length > 0 && (
            <TrendChart data={weightData} type="weight" title="體重變化" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart data={waterData} type="water" title="飲水量趨勢" />

          <TrendChart
            data={exerciseData}
            type="exercise"
            title="運動時長趨勢"
          />
        </div>
      </div>

      {/* Achievement Wall */}
      <AchievementWall />

      {/* Tips */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">健康建議</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          {summary && summary.avgCalories > 0 && (
            <>
              {summary.avgCalories > 2500 && (
                <div>
                  <p className="font-medium mb-1">卡路里攝取偏高</p>
                  <p className="text-gray-600">
                    平均每日攝取 {Math.round(summary.avgCalories)}{" "}
                    卡,建議控制在目標範圍內
                  </p>
                </div>
              )}

              {summary.avgWater < 1500 && (
                <div>
                  <p className="font-medium mb-1">飲水量不足</p>
                  <p className="text-gray-600">
                    平均每日飲水 {Math.round(summary.avgWater)}ml,建議增加至
                    2000ml 以上
                  </p>
                </div>
              )}

              {summary.avgExercise < 30 && (
                <div>
                  <p className="font-medium mb-1">運動量不足</p>
                  <p className="text-gray-600">
                    平均每日運動 {Math.round(summary.avgExercise)}{" "}
                    分鐘,建議增加至 30 分鐘以上
                  </p>
                </div>
              )}

              {summary.streak >= 7 && (
                <div>
                  <p className="font-medium mb-1">堅持打卡</p>
                  <p className="text-gray-600">
                    太棒了!已連續記錄 {summary.streak} 天,繼續保持!
                  </p>
                </div>
              )}

              {goalSuccessRate >= 80 && (
                <div>
                  <p className="font-medium mb-1">目標達成優秀</p>
                  <p className="text-gray-600">
                    目標達成率 {goalSuccessRate}%,表現很好!
                  </p>
                </div>
              )}
            </>
          )}

          {(!summary || summary.avgCalories === 0) && (
            <div className="col-span-3 text-center py-4">
              <p className="text-gray-500">開始記錄飲食,解鎖個人化健康建議!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
