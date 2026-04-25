import { z } from 'zod';

export const goalsUpdateSchema = z.object({
  targetWeight: z
    .number()
    .min(20, '目標體重至少 20 公斤')
    .max(500, '目標體重最多 500 公斤')
    .optional(),
  dailyCalorieGoal: z
    .number()
    .min(800, '每日卡路里目標至少 800')
    .max(10000, '每日卡路里目標最多 10000')
    .optional(),
  weeklyWeightChange: z
    .number()
    .min(-2, '每週體重變化最小 -2 公斤')
    .max(2, '每週體重變化最大 2 公斤')
    .optional(),
  targetDate: z.string().datetime().or(z.date()).optional(),
  goalType: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_WEIGHT', 'BUILD_MUSCLE']).optional(),
  dailyProteinGoal: z.number().min(0).max(500).optional(),
  dailyCarbsGoal: z.number().min(0).max(1000).optional(),
  dailyFatGoal: z.number().min(0).max(500).optional(),
  dailyWaterGoal: z
    .number()
    .min(500, '每日飲水目標至少 500ml')
    .max(10000, '每日飲水目標最多 10000ml')
    .optional(),
});

export type GoalsUpdateInput = z.infer<typeof goalsUpdateSchema>;
