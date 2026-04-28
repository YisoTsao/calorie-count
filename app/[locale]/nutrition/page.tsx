import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import WaterIntakeCard from '@/components/nutrition/WaterIntakeCard';
import ExerciseLogger from '@/components/nutrition/ExerciseLogger';
import WeightTracker from '@/components/nutrition/WeightTracker';
import NutritionQuickStats from '@/components/nutrition/NutritionQuickStats';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nutrition');
  return {
    title: `${t('title')} - Calorie Count`,
    description: t('pageSubtitle'),
  };
}

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const t = await getTranslations('nutrition');

  return (
    <DashboardShell user={session.user}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600">{t('pageSubtitle')}</p>
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
        <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('tipsTitle')}</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          <div>
            <p className="mb-1 font-medium">{t('tips.water.title')}</p>
            <p className="text-gray-600">{t('tips.water.desc')}</p>
          </div>
          <div>
            <p className="mb-1 font-medium">{t('tips.exercise.title')}</p>
            <p className="text-gray-600">{t('tips.exercise.desc')}</p>
          </div>
          <div>
            <p className="mb-1 font-medium">{t('tips.weight.title')}</p>
            <p className="text-gray-600">{t('tips.weight.desc')}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
