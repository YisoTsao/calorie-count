import { z } from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '請輸入當前密碼'),
    newPassword: z
      .string()
      .min(8, '新密碼至少需要 8 個字元')
      .max(100, '新密碼不能超過 100 個字元')
      .regex(/[A-Z]/, '新密碼必須包含至少一個大寫字母')
      .regex(/[a-z]/, '新密碼必須包含至少一個小寫字母')
      .regex(/[0-9]/, '新密碼必須包含至少一個數字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密碼與確認密碼不符',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '新密碼不能與當前密碼相同',
    path: ['newPassword'],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
