import { z } from 'zod';

export const foodItemSchema = z.object({
  name: z.string().min(1, '食物名稱不可為空').max(100),
  nameEn: z.string().max(100).optional(),
  portion: z.string().min(1, '份量描述不可為空').max(100),
  portionSize: z.number().min(0.1, '份量數值必須大於 0').max(10000),
  portionUnit: z.string().min(1, '份量單位不可為空').max(20),
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(1000),
  fiber: z.number().min(0).max(1000).optional(),
  sugar: z.number().min(0).max(1000).optional(),
  sodium: z.number().min(0).max(10000).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const updateFoodsSchema = z.object({
  foods: z.array(foodItemSchema).min(1, '至少需要一項食物'),
});

export type FoodItem = z.infer<typeof foodItemSchema>;
export type UpdateFoodsInput = z.infer<typeof updateFoodsSchema>;
