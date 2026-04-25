/**
 * 使用者相關型別定義
 */

import type {
  User,
  UserProfile,
  UserGoals,
  UserPreferences,
  Gender,
  ActivityLevel,
  GoalType,
  Theme,
  Units,
  ProfileVisibility,
} from '@prisma/client';

// 完整使用者資料 (包含關聯資料)
export interface UserWithRelations extends User {
  profile?: UserProfile | null;
  goals?: UserGoals | null;
  preferences?: UserPreferences | null;
}

// 公開使用者資料 (不包含敏感資訊)
export interface PublicUser {
  id: string;
  name: string | null;
  image: string | null;
}

// 使用者基本資訊
export interface UserBasicInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

// 個人資料更新請求
export interface UpdateProfileRequest {
  profile?: {
    dateOfBirth?: string;
    gender?: Gender;
    height?: number;
    weight?: number;
    targetWeight?: number;
    activityLevel?: ActivityLevel;
  };
  goals?: {
    goalType?: GoalType;
    dailyCalorieGoal?: number;
    proteinGoal?: number;
    carbsGoal?: number;
    fatGoal?: number;
    waterGoal?: number;
    targetDate?: string;
  };
  preferences?: {
    theme?: Theme;
    language?: string;
    units?: Units;
    notificationMealReminders?: boolean;
    notificationWaterReminders?: boolean;
    notificationGoalReminders?: boolean;
    notificationSocialUpdates?: boolean;
    privacyProfileVisibility?: ProfileVisibility;
    privacyShowWeight?: boolean;
    privacyShowProgress?: boolean;
  };
}

// 匯出 Prisma 的 enum 型別以便在其他地方使用
export type { Gender, ActivityLevel, GoalType, Theme, Units, ProfileVisibility };
