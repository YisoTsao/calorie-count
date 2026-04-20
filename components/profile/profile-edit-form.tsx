'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
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
        throw new Error(result.error?.message || '更新失敗');
      }

      router.refresh();
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>編輯個人資料</CardTitle>
        <CardDescription>更新您的基本資訊</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">身高 (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                {...register('height', { valueAsNumber: true })}
              />
              {errors.height && (
                <p className="text-sm text-destructive">{errors.height.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">體重 (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight', { valueAsNumber: true })}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">生日</Label>
            <Input id="birthDate" type="date" {...register('birthDate')} />
            {errors.birthDate && (
              <p className="text-sm text-destructive">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">性別</Label>
            <select
              id="gender"
              {...register('gender')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">請選擇</option>
              <option value="MALE">男性</option>
              <option value="FEMALE">女性</option>
              <option value="OTHER">其他</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">活動量</Label>
            <select
              id="activityLevel"
              {...register('activityLevel')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">請選擇</option>
              <option value="SEDENTARY">久坐</option>
              <option value="LIGHT">輕度活動</option>
              <option value="MODERATE">中度活動</option>
              <option value="ACTIVE">活躍</option>
              <option value="VERY_ACTIVE">非常活躍</option>
            </select>
            {errors.activityLevel && (
              <p className="text-sm text-destructive">{errors.activityLevel.message}</p>
            )}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="bio">個人簡介</Label>
            <textarea
              id="bio"
              {...register('bio')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div> */}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              儲存變更
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
