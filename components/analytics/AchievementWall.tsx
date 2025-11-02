'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

const ACHIEVEMENT_COLORS: Record<string, string> = {
  STREAK_7: 'bg-orange-100 text-orange-700',
  STREAK_30: 'bg-red-100 text-red-700',
  STREAK_100: 'bg-purple-100 text-purple-700',
  WEIGHT_GOAL: 'bg-green-100 text-green-700',
  CALORIE_GOAL_WEEK: 'bg-blue-100 text-blue-700',
  CALORIE_GOAL_MONTH: 'bg-indigo-100 text-indigo-700',
  WATER_CHAMPION: 'bg-cyan-100 text-cyan-700',
  EXERCISE_WARRIOR: 'bg-amber-100 text-amber-700',
  FIRST_MEAL: 'bg-gray-100 text-gray-700',
  FIRST_WEEK: 'bg-pink-100 text-pink-700',
};

export default function AchievementWall() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (!response.ok) throw new Error('載入失敗');
      
      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('載入成就失敗:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <span className="text-sm text-gray-500">{achievements.length} 個成就</span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">尚未獲得任何成就</p>
          <p className="text-sm text-gray-400">持續記錄,解鎖更多成就!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                ${ACHIEVEMENT_COLORS[achievement.type] || 'bg-gray-100 text-gray-700'}
                rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs opacity-80 mb-2">{achievement.description}</p>
                  <p className="text-xs opacity-60">
                    {new Date(achievement.earnedAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 可獲得的成就預覽 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">🎯 可獲得成就</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🔥', name: '新手上路', desc: '連續記錄 7 天' },
            { icon: '💪', name: '習慣養成', desc: '連續記錄 30 天' },
            { icon: '💧', name: '補水達人', desc: '連續一週達成飲水目標' },
            { icon: '🏃', name: '運動健將', desc: '連續一週堅持運動' },
          ].filter(potential => !achievements.some(a => a.title === potential.name)).map((potential, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-3 text-center opacity-60"
            >
              <span className="text-2xl mb-1 block">{potential.icon}</span>
              <p className="text-xs font-medium text-gray-700">{potential.name}</p>
              <p className="text-xs text-gray-500 mt-1">{potential.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
