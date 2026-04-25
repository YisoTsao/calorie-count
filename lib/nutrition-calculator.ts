/**
 * 營養目標計算工具
 * 根據使用者資料計算建議的營養目標
 */

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type GoalType = 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'MAINTAIN';

export interface UserData {
  age: number; // 年齡
  gender: Gender;
  weight: number; // 體重 (公斤)
  height: number; // 身高 (公分)
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeight?: number; // 目標體重 (公斤)
}

export interface NutritionGoals {
  dailyCalories: number; // 每日卡路里目標
  protein: number; // 蛋白質 (克)
  carbs: number; // 碳水化合物 (克)
  fat: number; // 脂肪 (克)
  bmr: number; // 基礎代謝率
  tdee: number; // 每日總消耗
}

/**
 * 活動係數對應表
 */
const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2, // 久坐 (很少或無運動)
  LIGHT: 1.375, // 輕度活動 (每週運動 1-3 天)
  MODERATE: 1.55, // 中度活動 (每週運動 3-5 天)
  ACTIVE: 1.725, // 活躍 (每週運動 6-7 天)
  VERY_ACTIVE: 1.9, // 非常活躍 (每天運動，體力工作)
};

/**
 * 計算 BMR (基礎代謝率) - 使用 Mifflin-St Jeor 公式
 * 這是目前最準確的 BMR 計算公式之一
 */
export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  // Mifflin-St Jeor 公式
  // 男性: (10 × 體重kg) + (6.25 × 身高cm) - (5 × 年齡) + 5
  // 女性: (10 × 體重kg) + (6.25 × 身高cm) - (5 × 年齡) - 161

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  if (gender === 'MALE') {
    return baseBMR + 5;
  } else if (gender === 'FEMALE') {
    return baseBMR - 161;
  } else {
    // OTHER - 使用平均值
    return baseBMR - 78;
  }
}

/**
 * 計算 TDEE (每日總消耗) - BMR × 活動係數
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * 計算建議的營養目標
 */
export function calculateNutritionGoals(userData: UserData): NutritionGoals {
  const { age, gender, weight, height, activityLevel, goalType } = userData;

  // 1. 計算 BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // 2. 計算 TDEE
  const tdee = calculateTDEE(bmr, activityLevel);

  // 3. 根據目標類型調整卡路里
  let dailyCalories = tdee;

  switch (goalType) {
    case 'LOSE_WEIGHT':
      // 減重: TDEE - 500 kcal (每週減重約 0.5kg)
      dailyCalories = tdee - 500;
      // 確保不低於 BMR 的 80%（避免過度節食）
      dailyCalories = Math.max(dailyCalories, bmr * 0.8);
      break;

    case 'GAIN_WEIGHT':
      // 增重: TDEE + 300-500 kcal (健康增重)
      dailyCalories = tdee + 400;
      break;

    case 'MAINTAIN':
      // 維持: TDEE
      dailyCalories = tdee;
      break;
  }

  // 4. 計算營養素分配
  const { protein, carbs, fat } = calculateMacros(dailyCalories, weight, goalType);

  return {
    dailyCalories: Math.round(dailyCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

/**
 * 計算三大營養素分配
 */
function calculateMacros(
  calories: number,
  weight: number,
  goalType: GoalType
): { protein: number; carbs: number; fat: number } {
  let proteinGramsPerKg: number;
  let fatPercentage: number;

  switch (goalType) {
    case 'LOSE_WEIGHT':
      // 減重: 高蛋白、中碳水、低脂肪
      proteinGramsPerKg = 2.0; // 2g/kg 體重
      fatPercentage = 0.25; // 25% 脂肪
      break;

    case 'GAIN_WEIGHT':
      // 增重: 中蛋白、高碳水、中脂肪
      proteinGramsPerKg = 1.8; // 1.8g/kg 體重
      fatPercentage = 0.25; // 25% 脂肪
      break;

    case 'MAINTAIN':
    default:
      // 維持: 均衡營養
      proteinGramsPerKg = 1.6; // 1.6g/kg 體重
      fatPercentage = 0.3; // 30% 脂肪
      break;
  }

  // 蛋白質 (克) = 體重 × 每公斤蛋白質
  const protein = weight * proteinGramsPerKg;

  // 脂肪 (克) = (總卡路里 × 脂肪百分比) / 9
  const fat = (calories * fatPercentage) / 9;

  // 碳水化合物 (克) = (剩餘卡路里) / 4
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4;

  return { protein, carbs, fat };
}

/**
 * 計算 BMI
 */
export function calculateBMI(weight: number, height: number): number {
  // BMI = 體重(kg) / 身高(m)²
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * BMI 分類
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return '體重過輕';
  if (bmi < 24) return '正常範圍';
  if (bmi < 27) return '過重';
  if (bmi < 30) return '輕度肥胖';
  if (bmi < 35) return '中度肥胖';
  return '重度肥胖';
}

/**
 * 建議的體重範圍
 */
export function getHealthyWeightRange(height: number): { min: number; max: number } {
  const heightInMeters = height / 100;
  const minWeight = 18.5 * heightInMeters * heightInMeters;
  const maxWeight = 24 * heightInMeters * heightInMeters;

  return {
    min: Math.round(minWeight * 10) / 10,
    max: Math.round(maxWeight * 10) / 10,
  };
}

/**
 * 預估達成目標所需時間（週）
 */
export function estimateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  goalType: GoalType
): number {
  const weightDifference = Math.abs(targetWeight - currentWeight);

  // 安全的每週減重/增重速度
  const safeWeeklyChange = goalType === 'LOSE_WEIGHT' ? 0.5 : 0.3;

  return Math.ceil(weightDifference / safeWeeklyChange);
}
