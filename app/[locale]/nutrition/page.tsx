import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import WaterIntakeCard from '@/components/nutrition/WaterIntakeCard';
import ExerciseLogger from '@/components/nutrition/ExerciseLogger';
import WeightTracker from '@/components/nutrition/WeightTracker';
import NutritionQuickStats from '@/components/nutrition/NutritionQuickStats';

export const metadata: Metadata = {
  title: '營養追蹤 - Calorie Count',
  description: '追蹤每日飲水量、運動消耗及體重變化',
};

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">營養追蹤</h1>
        <p className="text-gray-600">記錄您的飲水、運動與體重,全方位管理健康狀態</p>
      </div>

      {/* Quick Stats – dynamic client component */}
      <NutritionQuickStats />

      {/* Tracking Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">💡 健康小提醒</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          <div>
            <p className="mb-1 font-medium">💧 充足飲水</p>
            <p className="text-gray-600">建議每日攝取 2000-2500ml 水分,幫助新陳代謝</p>
          </div>
          <div>
            <p className="mb-1 font-medium">🏃‍♂️ 規律運動</p>
            <p className="text-gray-600">每週至少 150 分鐘中強度運動,維持健康體態</p>
          </div>
          <div>
            <p className="mb-1 font-medium">⚖️ 定期測量</p>
            <p className="text-gray-600">建議每日固定時間測量體重,掌握變化趨勢</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
