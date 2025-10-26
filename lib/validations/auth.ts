import { z } from 'zod';

/**
 * 註冊 Schema
 */
export const registerSchema = z.object({
  email: z.string().email({ message: 'Email 格式不正確' }),
  password: z
    .string()
    .min(8, { message: '密碼至少需要 8 個字元' })
    .regex(/[A-Z]/, { message: '密碼需包含至少一個大寫字母' })
    .regex(/[a-z]/, { message: '密碼需包含至少一個小寫字母' })
    .regex(/[0-9]/, { message: '密碼需包含至少一個數字' }),
  name: z.string().min(1, { message: '姓名為必填項目' }).max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * 登入 Schema
 */
export const loginSchema = z.object({
  email: z.string().email({ message: 'Email 格式不正確' }),
  password: z.string().min(1, { message: '請輸入密碼' }),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * 忘記密碼 Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email 格式不正確' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * 重置密碼 Schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token 為必填項目' }),
  password: z
    .string()
    .min(8, { message: '密碼至少需要 8 個字元' })
    .regex(/[A-Z]/, { message: '密碼需包含至少一個大寫字母' })
    .regex(/[a-z]/, { message: '密碼需包含至少一個小寫字母' })
    .regex(/[0-9]/, { message: '密碼需包含至少一個數字' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * 更新個人資料 Schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  targetWeight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
