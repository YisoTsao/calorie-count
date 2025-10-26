import { z } from 'zod';

export const preferencesUpdateSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  language: z.enum(['zh-TW', 'zh-CN', 'en', 'ja']).optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  mealReminders: z.boolean().optional(),
  waterReminders: z.boolean().optional(),
  exerciseReminders: z.boolean().optional(),
  measurementUnit: z.enum(['METRIC', 'IMPERIAL']).optional(),
  privacyLevel: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
});

export type PreferencesUpdateInput = z.infer<typeof preferencesUpdateSchema>;
