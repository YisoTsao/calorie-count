/**
 * 健康指標計算工具
 * 包含 BMI, BMR, TDEE 等計算
 */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel = 
  | 'SEDENTARY'           // 久坐 (很少運動)
  | 'LIGHTLY_ACTIVE'      // 輕度活動 (每週運動 1-3 天)
  | 'MODERATELY_ACTIVE'   // 中度活動 (每週運動 3-5 天)
  | 'VERY_ACTIVE'         // 高度活動 (每週運動 6-7 天)
  | 'EXTREMELY_ACTIVE';   // 極度活動 (每天運動,體力勞動工作)

export type GoalType = 
  | 'LOSE_WEIGHT'    // 減重
  | 'MAINTAIN'       // 維持
  | 'GAIN_WEIGHT'    // 增重
  | 'BUILD_MUSCLE';  // 增肌

/**
 * 計算 BMI (Body Mass Index - 身體質量指數)
 * 公式: BMI = 體重(kg) / 身高(m)²
 */
export function calculateBMI(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) {
    throw new Error('體重和身高必須大於 0');
  }

  const heightInMeters = height / 100; // 公分轉公尺
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // 四捨五入到小數點後一位
}

/**
 * BMI 分類
 */
export function getBMICategory(bmi: number): {
  category: string;
  description: string;
  color: string;
} {
  if (bmi < 18.5) {
    return {
      category: '過輕',
      description: '體重過輕,建議增加營養攝取',
      color: 'blue',
    };
  } else if (bmi < 24) {
    return {
      category: '正常',
      description: '體重正常,請繼續保持',
      color: 'green',
    };
  } else if (bmi < 27) {
    return {
      category: '過重',
      description: '體重過重,建議控制飲食與運動',
      color: 'yellow',
    };
  } else if (bmi < 30) {
    return {
      category: '輕度肥胖',
      description: '輕度肥胖,建議諮詢營養師',
      color: 'orange',
    };
  } else if (bmi < 35) {
    return {
      category: '中度肥胖',
      description: '中度肥胖,請尋求專業協助',
      color: 'red',
    };
  } else {
    return {
      category: '重度肥胖',
      description: '重度肥胖,強烈建議就醫諮詢',
      color: 'red',
    };
  }
}

/**
 * 計算 BMR (Basal Metabolic Rate - 基礎代謝率)
 * 使用 Mifflin-St Jeor 公式 (較準確)
 * 
 * 男性: BMR = (10 × 體重kg) + (6.25 × 身高cm) - (5 × 年齡) + 5
 * 女性: BMR = (10 × 體重kg) + (6.25 × 身高cm) - (5 × 年齡) - 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('體重、身高和年齡必須大於 0');
  }

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);

  if (gender === 'MALE') {
    bmr += 5;
  } else if (gender === 'FEMALE') {
    bmr -= 161;
  } else {
    // OTHER: 使用平均值
    bmr -= 78; // (5 + (-161)) / 2
  }

  return Math.round(bmr);
}

/**
 * 活動係數對應表
 */
const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,           // 久坐
  LIGHTLY_ACTIVE: 1.375,    // 輕度活動
  MODERATELY_ACTIVE: 1.55,  // 中度活動
  VERY_ACTIVE: 1.725,       // 高度活動
  EXTREMELY_ACTIVE: 1.9,    // 極度活動
};

/**
 * 計算 TDEE (Total Daily Energy Expenditure - 每日總消耗熱量)
 * 公式: TDEE = BMR × 活動係數
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = ACTIVITY_MULTIPLIER[activityLevel];
  const tdee = bmr * multiplier;
  
  return Math.round(tdee);
}

/**
 * 根據目標計算建議的每日卡路里攝取量
 * 
 * @param tdee - 每日總消耗熱量
 * @param goalType - 目標類型
 * @param weeklyWeightChange - 每週預期體重變化 (kg)，正數為增重，負數為減重
 */
export function calculateDailyCalorieGoal(
  tdee: number,
  goalType: GoalType,
  weeklyWeightChange: number = 0
): number {
  // 1kg 脂肪 ≈ 7700 卡路里
  // 每週變化 x kg = 每日變化 x/7 kg = 每日熱量差 (x/7) * 7700
  const dailyCalorieAdjustment = (weeklyWeightChange / 7) * 7700;

  let calorieGoal = tdee;

  switch (goalType) {
    case 'LOSE_WEIGHT':
      // 減重: TDEE - 每日熱量赤字
      // 通常建議每週減 0.5-1kg (每日赤字 250-500 卡)
      calorieGoal = tdee + dailyCalorieAdjustment; // weeklyWeightChange 為負數
      // 確保不低於基礎代謝率的 80%
      calorieGoal = Math.max(calorieGoal, tdee * 0.6);
      break;

    case 'GAIN_WEIGHT':
    case 'BUILD_MUSCLE':
      // 增重/增肌: TDEE + 每日熱量盈餘
      // 通常建議每週增 0.25-0.5kg (每日盈餘 125-250 卡)
      calorieGoal = tdee + dailyCalorieAdjustment; // weeklyWeightChange 為正數
      break;

    case 'MAINTAIN':
      // 維持: TDEE
      calorieGoal = tdee;
      break;
  }

  return Math.round(calorieGoal);
}

/**
 * 計算建議的巨量營養素分配 (蛋白質、碳水、脂肪)
 */
export function calculateMacronutrients(
  dailyCalories: number,
  goalType: GoalType,
  weight: number
): {
  protein: number;    // 蛋白質 (克)
  carbs: number;      // 碳水化合物 (克)
  fat: number;        // 脂肪 (克)
  proteinCal: number; // 蛋白質卡路里
  carbsCal: number;   // 碳水卡路里
  fatCal: number;     // 脂肪卡路里
} {
  let proteinRatio: number;
  let fatRatio: number;

  switch (goalType) {
    case 'LOSE_WEIGHT':
      // 減重: 高蛋白 (35%), 中碳水 (35%), 低脂 (30%)
      proteinRatio = 0.35;
      fatRatio = 0.30;
      break;

    case 'BUILD_MUSCLE':
      // 增肌: 高蛋白 (30%), 高碳水 (45%), 低脂 (25%)
      proteinRatio = 0.30;
      fatRatio = 0.25;
      break;

    case 'GAIN_WEIGHT':
      // 增重: 中蛋白 (25%), 高碳水 (50%), 中脂 (25%)
      proteinRatio = 0.25;
      fatRatio = 0.25;
      break;

    case 'MAINTAIN':
    default:
      // 維持: 均衡 (30%, 40%, 30%)
      proteinRatio = 0.30;
      fatRatio = 0.30;
      break;
  }

  const carbsRatio = 1 - proteinRatio - fatRatio;

  // 計算卡路里分配
  const proteinCal = dailyCalories * proteinRatio;
  const carbsCal = dailyCalories * carbsRatio;
  const fatCal = dailyCalories * fatRatio;

  // 轉換為克數
  // 1g 蛋白質 = 4 卡, 1g 碳水 = 4 卡, 1g 脂肪 = 9 卡
  const protein = Math.round(proteinCal / 4);
  const carbs = Math.round(carbsCal / 4);
  const fat = Math.round(fatCal / 9);

  return {
    protein,
    carbs,
    fat,
    proteinCal: Math.round(proteinCal),
    carbsCal: Math.round(carbsCal),
    fatCal: Math.round(fatCal),
  };
}

/**
 * 計算理想體重範圍 (根據 BMI 18.5-24)
 */
export function calculateIdealWeightRange(height: number): {
  min: number;
  max: number;
} {
  const heightInMeters = height / 100;
  const min = 18.5 * heightInMeters * heightInMeters;
  const max = 24 * heightInMeters * heightInMeters;

  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
  };
}

/**
 * 計算目標達成預估日期
 */
export function calculateGoalDate(
  currentWeight: number,
  targetWeight: number,
  weeklyWeightChange: number
): Date | null {
  if (weeklyWeightChange === 0) {
    return null; // 無法計算
  }

  const totalChange = targetWeight - currentWeight;
  const weeks = Math.abs(totalChange / weeklyWeightChange);
  const days = weeks * 7;

  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + days);

  return goalDate;
}

/**
 * 計算建議的每日飲水量 (ml)
 * 基礎: 體重(kg) × 30-35ml
 */
export function calculateDailyWaterGoal(weight: number, activityLevel: ActivityLevel): number {
  let baseWater = weight * 33; // 使用中間值 33ml

  // 根據活動量調整
  const activityAdjustment: Record<ActivityLevel, number> = {
    SEDENTARY: 1.0,
    LIGHTLY_ACTIVE: 1.1,
    MODERATELY_ACTIVE: 1.2,
    VERY_ACTIVE: 1.3,
    EXTREMELY_ACTIVE: 1.4,
  };

  baseWater *= activityAdjustment[activityLevel];

  // 四捨五入到最接近的 100ml
  return Math.round(baseWater / 100) * 100;
}
