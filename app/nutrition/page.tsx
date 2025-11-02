import { Metadata } from 'next';
import WaterIntakeCard from '@/components/nutrition/WaterIntakeCard';
import ExerciseLogger from '@/components/nutrition/ExerciseLogger';
import WeightTracker from '@/components/nutrition/WeightTracker';

export const metadata: Metadata = {
  title: '營養追蹤 - Calorie Count',
  description: '追蹤每日飲水量、運動消耗及體重變化'
};

export default function NutritionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">營養追蹤</h1>
        <p className="text-gray-600">
          記錄您的飲水、運動與體重,全方位管理健康狀態
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">今日飲水</p>
              <p className="text-3xl font-bold">- ml</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">今日消耗</p>
              <p className="text-3xl font-bold">- 卡</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">目前體重</p>
              <p className="text-3xl font-bold">- kg</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Water Intake */}
        <WaterIntakeCard dailyGoal={2000} />

        {/* Exercise Logger */}
        <ExerciseLogger dailyCalorieGoal={300} />
      </div>

      {/* Weight Tracker */}
      <div className="mb-8">
        <WeightTracker />
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 健康小提醒</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-1">💧 充足飲水</p>
            <p className="text-gray-600">建議每日攝取 2000-2500ml 水分,幫助新陳代謝</p>
          </div>
          <div>
            <p className="font-medium mb-1">🏃‍♂️ 規律運動</p>
            <p className="text-gray-600">每週至少 150 分鐘中強度運動,維持健康體態</p>
          </div>
          <div>
            <p className="font-medium mb-1">⚖️ 定期測量</p>
            <p className="text-gray-600">建議每日固定時間測量體重,掌握變化趨勢</p>
          </div>
        </div>
      </div>
    </div>
  );
}
