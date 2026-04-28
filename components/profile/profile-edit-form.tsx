'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  defaultValues?: Partial<ProfileFormData>;
}

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const response = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || t('saveError'));
      }

      router.refresh();
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editProfile')}</CardTitle>
        <CardDescription>{t('editSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded bg-destructive/15 px-4 py-3 text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">{t('height')}</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                {...register('height', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined ? undefined : Number(v),
                })}
              />
              {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">{t('weight')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight', {
                  setValueAs: (v) =>
                    v === '' || v === null || v === undefined ? undefined : Number(v),
                })}
              />
              {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">{t('birthday')}</Label>
            <Input id="birthDate" type="date" {...register('birthDate')} />
            {errors.birthDate && (
              <p className="text-sm text-destructive">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t('gender')}</Label>
            <select
              id="gender"
              {...register('gender', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">{t('selectGender')}</option>
              <option value="MALE">{t('genders.male')}</option>
              <option value="FEMALE">{t('genders.female')}</option>
              <option value="OTHER">{t('genders.other')}</option>
            </select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">{t('activityLevel')}</Label>
            <select
              id="activityLevel"
              {...register('activityLevel', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">{t('selectActivityLevel')}</option>
              <option value="SEDENTARY">{t('activityLevels.sedentary')}</option>
              <option value="LIGHT">{t('activityLevels.light')}</option>
              <option value="MODERATE">{t('activityLevels.moderate')}</option>
              <option value="ACTIVE">{t('activityLevels.active')}</option>
              <option value="VERY_ACTIVE">{t('activityLevels.veryActive')}</option>
            </select>
            {errors.activityLevel && (
              <p className="text-sm text-destructive">{errors.activityLevel.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
