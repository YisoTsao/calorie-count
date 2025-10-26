/**
 * 分頁參數
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分頁後設資料
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * 用戶個人資料
 */
export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  targetWeight: number | null;
  activityLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用戶目標
 */
export interface UserGoals {
  id: string;
  userId: string;
  goalType: string;
  targetCalories: number;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用戶偏好設定
 */
export interface UserPreferences {
  id: string;
  userId: string;
  theme: string;
  language: string;
  timezone: string;
  units: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReportEnabled: boolean;
  profileVisibility: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 食物營養資訊
 */
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  servingUnit?: string;
}

/**
 * 食物項目
 */
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  nutrition: NutritionInfo;
  imageUrl?: string;
  barcode?: string;
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 餐點記錄
 */
export interface MealEntry {
  id: string;
  userId: string;
  date: Date;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodId: string;
  food?: FoodItem;
  servings: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 日常營養統計
 */
export interface DailyNutritionStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealsCount: number;
  goalCalories: number;
  remainingCalories: number;
  progressPercentage: number;
}

/**
 * 體重記錄
 */
export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

/**
 * AI 食物識別結果
 */
export interface FoodRecognitionResult {
  confidence: number;
  foodName: string;
  estimatedNutrition: NutritionInfo;
  alternatives?: Array<{
    foodName: string;
    confidence: number;
  }>;
}
