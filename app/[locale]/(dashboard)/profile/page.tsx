import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { AvatarUploader } from '@/components/profile/AvatarUploader';

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const tm = await getTranslations('dashboard');
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, goals: true, preferences: true },
  });

  if (!user) redirect('/login');

  const bmi =
    user.profile?.height && user.profile?.weight
      ? (user.profile.weight / Math.pow(user.profile.height / 100, 2)).toFixed(1)
      : null;

  const activityLabels: Record<string, string> = {
    SEDENTARY: '久坐',
    LIGHT: '輕度活動',
    MODERATE: '適度活動',
    ACTIVE: '活躍',
    VERY_ACTIVE: '非常活躍',
  };

  const genderLabels: Record<string, string> = {
    MALE: '男性',
    FEMALE: '女性',
    OTHER: '其他',
  };

  const stats = [
    {
      label: t('height'),
      value: user.profile?.height ?? null,
      unit: 'cm',
      accentClass: 'border-t-emerald-400',
    },
    {
      label: t('weight'),
      value: user.profile?.weight ?? null,
      unit: 'kg',
      accentClass: 'border-t-teal-400',
    },
    {
      label: 'BMI',
      value: bmi,
      unit: '',
      accentClass: 'border-t-cyan-400',
    },
    {
      label: t('targetWeight'),
      value: user.profile?.targetWeight ?? null,
      unit: 'kg',
      accentClass: 'border-t-sky-400',
    },
  ];

  return (
    <div className="h-fit bg-gradient-to-b from-white via-stone-50/50 to-white">
      {/* 極淡背景裝飾 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-emerald-400/[0.04]" />
        <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-teal-400/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
        {/* ── Hero 區塊 ── */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* 頭像 */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20 blur-sm" />
              <div className="relative rounded-full ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-white">
                <AvatarUploader currentImage={user.image} userName={user.name} size={80} />
              </div>
            </div>
            {/* 姓名 + Email */}
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                個人檔案
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {user.name || '使用者'}
              </h1>
              <p className="mt-0.5 text-sm text-stone-400">{user.email}</p>
            </div>
          </div>

          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="gap-2 border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Edit className="h-4 w-4" />
              {t('editProfile')}
            </Button>
          </Link>
        </div>

        {/* ── 統計指標（4 欄） ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {stats.map(({ label, value, unit, accentClass }) => (
            <div
              key={label}
              className={`rounded-xl border border-t-2 border-stone-100 ${accentClass} bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5`}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{value ?? '—'}</p>
              {unit && <p className="mt-0.5 text-xs text-stone-400">{unit}</p>}
            </div>
          ))}
        </div>

        {/* ── 詳細資訊雙欄 ── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 個人資訊 */}
          <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-stone-700">{t('basicInfo')}</h2>
            </div>
            <dl className="space-y-0 divide-y divide-stone-50">
              <div className="flex items-center justify-between py-3">
                <dt className="text-xs font-medium text-stone-400">{t('email')}</dt>
                <dd className="text-sm text-stone-700">{user.email}</dd>
              </div>
              {user.profile?.gender && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-xs font-medium text-stone-400">{t('gender')}</dt>
                  <dd className="text-sm text-stone-700">
                    {genderLabels[user.profile.gender] ?? user.profile.gender}
                  </dd>
                </div>
              )}
              {user.profile?.dateOfBirth && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-xs font-medium text-stone-400">{t('birthday')}</dt>
                  <dd className="text-sm text-stone-700">
                    {new Date(user.profile.dateOfBirth).toLocaleDateString('zh-TW')}
                  </dd>
                </div>
              )}
              {user.profile?.activityLevel && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-xs font-medium text-stone-400">{t('activityLevel')}</dt>
                  <dd className="text-sm font-semibold text-emerald-600">
                    {activityLabels[user.profile.activityLevel] ?? user.profile.activityLevel}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 每日目標 */}
          <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-teal-500" />
              <h2 className="text-sm font-semibold text-stone-700">{t('dailyGoals')}</h2>
            </div>
            {/* 卡路里 */}
            <div className="mb-4 rounded-xl bg-stone-50 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                {tm('calorieProgress')}
              </p>
              <p className="mt-1.5 text-3xl font-bold tabular-nums text-stone-900">
                {user.goals?.dailyCalorieGoal || 2000}
                <span className="ml-1.5 text-sm font-normal text-stone-400">kcal</span>
              </p>
            </div>
            {/* 三大營養素 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: tm('macros.protein'),
                  value: user.goals?.proteinGoal || 50,
                  colorClass: 'text-emerald-600',
                  bgClass: 'bg-emerald-50',
                },
                {
                  label: tm('macros.carbs'),
                  value: user.goals?.carbsGoal || 250,
                  colorClass: 'text-amber-600',
                  bgClass: 'bg-amber-50',
                },
                {
                  label: tm('macros.fat'),
                  value: user.goals?.fatGoal || 65,
                  colorClass: 'text-rose-500',
                  bgClass: 'bg-rose-50',
                },
              ].map(({ label, value, colorClass, bgClass }) => (
                <div key={label} className={`${bgClass} rounded-xl p-3 text-center`}>
                  <p className="text-[10px] font-medium text-stone-400">{label}</p>
                  <p className={`mt-1 text-xl font-bold tabular-nums ${colorClass}`}>{value}g</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

