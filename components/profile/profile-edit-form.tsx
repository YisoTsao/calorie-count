'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import type { z } from 'zod';

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  defaultValues?: Partial<ProfileFormData>;
  currentImage?: string | null;
  userName?: string | null;
}

export function ProfileEditForm({ defaultValues, currentImage, userName }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const router = useRouter();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (pendingAvatarFile) {
        const fd = new FormData();
        fd.append('avatar', pendingAvatarFile);
        const avatarRes = await fetch('/api/users/me/avatar', { method: 'POST', body: fd });
        if (!avatarRes.ok) {
          const d = await avatarRes.json();
          throw new Error(d.error?.message || '頭像上傳失敗');
        }
      }

      const response = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || t('saveError'));

      router.refresh();
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50/50 to-white">
      {/* 極淡背景裝飾 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-emerald-400/[0.04]" />
        <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-teal-400/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-8 sm:py-6">
        {/* ── 頁面標題 ── */}
        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            個人檔案
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            {t('editProfile')}
          </h1>
          <p className="mt-1.5 text-sm text-stone-400">{t('editSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 錯誤訊息 */}
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── 頭像 ── */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20 blur-sm" />
              <div className="relative rounded-full ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-white">
                <AvatarUploader
                  currentImage={currentImage}
                  userName={userName}
                  size={88}
                  mode="deferred"
                  onFileReady={(file) => setPendingAvatarFile(file)}
                />
              </div>
            </div>
          </div>

          {/* ── Section：基本資料 ── */}
          <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-stone-700">基本資料</h2>
            </div>

            <div className="space-y-4">
              {/* 姓名 */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {t('name')}
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  className="border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-300 focus:border-emerald-400 focus:bg-white focus:ring-emerald-400/20"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 性別 */}
              <div>
                <label htmlFor="gender" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {t('gender')}
                </label>
                <select
                  id="gender"
                  {...register('gender', { setValueAs: (v) => (v === '' ? undefined : v) })}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option value="">{t('selectGender')}</option>
                  <option value="MALE">{t('genders.male')}</option>
                  <option value="FEMALE">{t('genders.female')}</option>
                  <option value="OTHER">{t('genders.other')}</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>

              {/* 出生日期 */}
              <div>
                <label htmlFor="birthDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {t('birthday')}
                </label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className="border-stone-200 bg-stone-50 text-stone-900 focus:border-emerald-400 focus:bg-white focus:ring-emerald-400/20"
                />
                {errors.birthDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section：身體數據 ── */}
          <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-teal-500" />
              <h2 className="text-sm font-semibold text-stone-700">身體數據</h2>
            </div>

            <div className="space-y-4">
              {/* 身高 / 體重 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {t('height')}
                  </label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('height', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? undefined : Number(v),
                    })}
                    className="border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-300 focus:border-emerald-400 focus:bg-white focus:ring-emerald-400/20"
                  />
                  {errors.height && (
                    <p className="mt-1 text-xs text-red-500">{errors.height.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="weight" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {t('weight')}
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="kg"
                    {...register('weight', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? undefined : Number(v),
                    })}
                    className="border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-300 focus:border-emerald-400 focus:bg-white focus:ring-emerald-400/20"
                  />
                  {errors.weight && (
                    <p className="mt-1 text-xs text-red-500">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              {/* 活動水平 */}
              <div>
                <label htmlFor="activityLevel" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {t('activityLevel')}
                </label>
                <select
                  id="activityLevel"
                  {...register('activityLevel', { setValueAs: (v) => (v === '' ? undefined : v) })}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option value="">{t('selectActivityLevel')}</option>
                  <option value="SEDENTARY">{t('activityLevels.sedentary')}</option>
                  <option value="LIGHT">{t('activityLevels.light')}</option>
                  <option value="MODERATE">{t('activityLevels.moderate')}</option>
                  <option value="ACTIVE">{t('activityLevels.active')}</option>
                  <option value="VERY_ACTIVE">{t('activityLevels.veryActive')}</option>
                </select>
                {errors.activityLevel && (
                  <p className="mt-1 text-xs text-red-500">{errors.activityLevel.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── 操作按鈕 ── */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 sm:flex-none sm:min-w-[140px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t('saveChanges')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50 sm:flex-none"
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
