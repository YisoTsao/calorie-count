'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle, Clock } from 'lucide-react';
import { AchievementType } from '@prisma/client';

interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

interface StatsData {
  streak: number;
  totalDays: number;
  avgCalories: number;
  goalsMetDays: number;
}

interface AchievementWithProgress extends Achievement {
  earned: boolean;
  progress?: number;
  total?: number;
}

// 所有可能的成就定義
const ALL_ACHIEVEMENTS: Array<Omit<Achievement, 'id' | 'earnedAt'>> = [
  {
    type: 'FIRST_MEAL',
    title: '起步',
    description: '記錄了第一餐飲食',
    icon: '🍽️'
  },
  {
    type: 'FIRST_WEEK',
    title: '一週達成',
    description: '堅持記錄一週',
    icon: '📅'
  },
  {
    type: 'STREAK_7',
    title: '新手上路',
    description: '連續記錄 7 天飲食',
    icon: '🔥'
  },
  {
    type: 'STREAK_30',
    title: '習慣養成',
    description: '連續記錄 30 天飲食',
    icon: '💪'
  },
  {
    type: 'STREAK_100',
    title: '毅力大師',
    description: '連續記錄 100 天飲食',
    icon: '🏆'
  },
  {
    type: 'CALORIE_GOAL_WEEK',
    title: '卡路里達人',
    description: '連續一週達成卡路里目標',
    icon: '🎯'
  },
  {
    type: 'CALORIE_GOAL_MONTH',
    title: '卡路里大師',
    description: '連續一個月達成卡路里目標',
    icon: '🌟'
  },
  {
    type: 'WATER_CHAMPION',
    title: '補水達人',
    description: '連續一週達成飲水目標',
    icon: '💧'
  },
  {
    type: 'EXERCISE_WARRIOR',
    title: '運動健將',
    description: '連續一週堅持運動',
    icon: '🏃'
  },
  {
    type: 'WEIGHT_GOAL',
    title: '體重目標',
    description: '達成體重目標',
    icon: '⚖️'
  }
];

// 成就分類
const ACHIEVEMENT_CATEGORIES = {
  streak: { label: '打卡', types: ['FIRST_MEAL', 'FIRST_WEEK', 'STREAK_7', 'STREAK_30', 'STREAK_100'] },
  goal: { label: '目標', types: ['CALORIE_GOAL_WEEK', 'CALORIE_GOAL_MONTH', 'WATER_CHAMPION', 'EXERCISE_WARRIOR', 'WEIGHT_GOAL'] }
};

// 成就顏色
const ACHIEVEMENT_COLORS: Record<AchievementType, string> = {
  FIRST_MEAL: 'bg-gray-100 text-gray-700 border-gray-300',
  FIRST_WEEK: 'bg-pink-100 text-pink-700 border-pink-300',
  STREAK_7: 'bg-orange-100 text-orange-700 border-orange-300',
  STREAK_30: 'bg-red-100 text-red-700 border-red-300',
  STREAK_100: 'bg-purple-100 text-purple-700 border-purple-300',
  CALORIE_GOAL_WEEK: 'bg-blue-100 text-blue-700 border-blue-300',
  CALORIE_GOAL_MONTH: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  WATER_CHAMPION: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  EXERCISE_WARRIOR: 'bg-amber-100 text-amber-700 border-amber-300',
  WEIGHT_GOAL: 'bg-green-100 text-green-700 border-green-300'
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'streak' | 'goal'>('all');
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    loadAchievements();
    loadStats();
  }, []);

  const loadAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      
      // 合併已獲得和未獲得的成就
      const earnedMap = new Map<AchievementType, Achievement>(
        data.achievements.map((a: Achievement) => [a.type, a])
      );
      
      const allWithStatus: AchievementWithProgress[] = ALL_ACHIEVEMENTS.map(template => {
        const earned = earnedMap.get(template.type);
        return {
          ...template,
          id: earned ? earned.id : `pending-${template.type}`,
          earned: !!earned,
          earnedAt: earned ? earned.earnedAt : undefined
        };
      });
      
      setAchievements(allWithStatus);
    } catch (error) {
      console.error('載入成就失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats?days=100');
      const data = await res.json();
      setStats(data.summary);
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  // 計算成就進度
  const getAchievementProgress = (achievement: AchievementWithProgress): { progress: number; total: number } | null => {
    if (!stats) return null;
    
    switch (achievement.type) {
      case 'STREAK_7':
        return { progress: Math.min(stats.streak, 7), total: 7 };
      case 'STREAK_30':
        return { progress: Math.min(stats.streak, 30), total: 30 };
      case 'STREAK_100':
        return { progress: Math.min(stats.streak, 100), total: 100 };
      case 'FIRST_WEEK':
        return { progress: Math.min(stats.totalDays, 7), total: 7 };
      default:
        return null;
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory === 'all') return true;
    return ACHIEVEMENT_CATEGORIES[selectedCategory].types.includes(a.type);
  });

  const earnedAchievements = filteredAchievements.filter(a => a.earned);
  const inProgressAchievements = filteredAchievements.filter(a => {
    if (a.earned) return false;
    const progress = getAchievementProgress(a);
    return progress && progress.progress > 0;
  });
  const lockedAchievements = filteredAchievements.filter(a => {
    if (a.earned) return false;
    const progress = getAchievementProgress(a);
    return !progress || progress.progress === 0;
  });

  const completionRate = achievements.length > 0
    ? Math.round((earnedAchievements.length / achievements.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          我的成就
        </h1>
        <p className="text-gray-600 mt-2">
          已獲得 {earnedAchievements.length}/{achievements.length} · 完成率 {completionRate}%
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">總體進度</span>
          <span className="text-sm font-bold text-blue-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setSelectedCategory('streak')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            selectedCategory === 'streak'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔥 打卡
        </button>
        <button
          onClick={() => setSelectedCategory('goal')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            selectedCategory === 'goal'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 目標
        </button>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              已獲得 ({earnedAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                  ACHIEVEMENT_COLORS[achievement.type]
                }`}
              >
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>
                <p className="text-xs opacity-80 mb-2">{achievement.description}</p>
                {achievement.earnedAt && (
                  <p className="text-xs opacity-60">
                    {new Date(achievement.earnedAt).toLocaleDateString('zh-TW')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              進行中 ({inProgressAchievements.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {inProgressAchievements.map((achievement) => {
              const progress = getAchievementProgress(achievement);
              const percentage = progress ? Math.round((progress.progress / progress.total) * 100) : 0;
              
              return (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-200 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {progress && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {progress.progress} / {progress.total}
                            </span>
                            <span className="text-sm font-bold text-orange-600">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">
              未開始 ({lockedAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="relative p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
              >
                <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                <h3 className="font-bold text-sm mb-1 text-gray-700">{achievement.title}</h3>
                <p className="text-xs text-gray-500">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">還沒有成就記錄</p>
        </div>
      )}
    </div>
  );
}
