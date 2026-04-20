import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z.string().min(2, '姓名至少需要 2 個字元').max(50, '姓名不能超過 50 個字元').optional(),
  bio: z.string().max(500, '個人簡介不能超過 500 個字元').optional(),
  height: z.number().min(50, '身高至少 50 公分').max(300, '身高最多 300 公分').optional(),
  weight: z.number().min(20, '體重至少 20 公斤').max(500, '體重最多 500 公斤').optional(),
  birthDate: z.string().or(z.date()).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
});

export const avatarUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, '圖片大小不能超過 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '只支援 JPG, PNG, WebP 格式'
    ),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
