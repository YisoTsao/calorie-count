'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, TrendingDown, TrendingUp, Minus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateNutritionGoals,
  calculateBMI,
  getBMICategory,
  getHealthyWeightRange,
  estimateWeeksToGoal,
  type GoalType,
  type ActivityLevel,
  type Gender,
} from '@/lib/nutrition-calculator';

interface UserProfile {
  dateOfBirth: string | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  targetWeight: number | null;
  activityLevel: ActivityLevel;
}

const GOAL_TYPE_OPTIONS = [
  { value: 'LOSE_WEIGHT', label: '減重', icon: TrendingDown, color: 'text-blue-600' },
  { value: 'MAINTAIN', label: '維持', icon: Minus, color: 'text-green-600' },
  { value: 'GAIN_WEIGHT', label: '增重', icon: TrendingUp, color: 'text-orange-600' },
];

export default function GoalsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 表單狀態
  const [goalType, setGoalType] = useState<GoalType>('MAINTAIN');
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [protein, setProtein] = useState(50);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(65);

  // 載入使用者資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/goals');
        if (!response.ok) throw new Error('查詢失敗');

        const data = await response.json();
        setProfile(data.data.profile);

        // 初始化表單
        if (data.data.goals) {
          setGoalType(data.data.goals.goalType);
          setDailyCalories(data.data.goals.dailyCalorieGoal);
          setProtein(data.data.goals.proteinGoal);
          setCarbs(data.data.goals.carbsGoal);
          setFat(data.data.goals.fatGoal);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 自動計算建議目標
  const calculateRecommendedGoals = () => {
    if (!profile?.height || !profile?.weight || !profile?.dateOfBirth) {
      alert('請先完善個人資料（身高、體重、出生日期）');
      router.push('/profile');
      return;
    }

    const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();

    const recommendations = calculateNutritionGoals({
      age,
      gender: profile.gender || 'OTHER',
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel || 'MODERATE',
      goalType,
      targetWeight: profile.targetWeight || profile.weight,
    });

    setDailyCalories(recommendations.dailyCalories);
    setProtein(recommendations.protein);
    setCarbs(recommendations.carbs);
    setFat(recommendations.fat);

    alert(`✅ 已根據您的資料計算建議目標！\n\nBMR: ${recommendations.bmr} kcal\nTDEE: ${recommendations.tdee} kcal`);
  };

  // 儲存目標
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType,
          dailyCalorieGoal: dailyCalories,
          proteinGoal: protein,
          carbsGoal: carbs,
          fatGoal: fat,
        }),
      });

      if (!response.ok) throw new Error('儲存失敗');

      alert('✅ 目標已儲存！');
      router.push('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      alert('儲存失敗，請稍後再試');
      setIsSaving(false);
    }
  };

  // 計算 BMI 和健康體重範圍
  const bmi = profile?.height && profile?.weight
    ? calculateBMI(profile.weight, profile.height)
    : null;

  const healthyRange = profile?.height
    ? getHealthyWeightRange(profile.height)
    : null;

  const weeksToGoal = profile?.weight && profile?.targetWeight && goalType !== 'MAINTAIN'
    ? estimateWeeksToGoal(profile.weight, profile.targetWeight, goalType)
    : null;

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <p className="text-center">載入中...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* 頁首 */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="h-8 w-8" />
          目標設定
        </h1>
        <p className="text-muted-foreground mt-1">設定您的營養目標，讓追蹤更有意義</p>
      </div>

      {/* BMI 資訊卡片 */}
      {bmi && (
        <Card>
          <CardHeader>
            <CardTitle>健康指標</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">目前 BMI</p>
                <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getBMICategory(bmi)}
                </p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">目前體重</p>
                <p className="text-2xl font-bold">{profile?.weight} kg</p>
                {profile?.targetWeight && (
                  <p className="text-xs text-muted-foreground mt-1">
                    目標: {profile.targetWeight} kg
                  </p>
                )}
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">建議體重範圍</p>
                <p className="text-xl font-bold">
                  {healthyRange?.min} - {healthyRange?.max} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">BMI 18.5-24</p>
              </div>
            </div>

            {weeksToGoal && (
              <div className="text-center text-sm text-muted-foreground">
                預估需要 <span className="font-bold text-foreground">{weeksToGoal}</span> 週達成目標
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 目標類型選擇 */}
      <Card>
        <CardHeader>
          <CardTitle>目標類型</CardTitle>
          <CardDescription>選擇您的健康目標</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {GOAL_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = goalType === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setGoalType(option.value as GoalType)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-primary' : option.color}`} />
                  <p className="font-medium">{option.label}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 每日營養目標 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>每日營養目標</CardTitle>
              <CardDescription>設定每日的營養素攝取目標</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={calculateRecommendedGoals}
              disabled={!profile?.height || !profile?.weight}
            >
              <Calculator className="h-4 w-4 mr-2" />
              自動計算
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="calories">卡路里 (kcal/天)</Label>
            <Input
              id="calories"
              type="number"
              value={dailyCalories}
              onChange={(e) => setDailyCalories(Number(e.target.value))}
              min={1000}
              max={5000}
              step={50}
            />
            <p className="text-xs text-muted-foreground">建議範圍: 1200-3000 kcal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">蛋白質 (g/天)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                min={0}
                max={500}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((protein * 4 / dailyCalories) * 100)}% 卡路里
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">碳水化合物 (g/天)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                min={0}
                max={1000}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((carbs * 4 / dailyCalories) * 100)}% 卡路里
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">脂肪 (g/天)</Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                min={0}
                max={300}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((fat * 9 / dailyCalories) * 100)}% 卡路里
              </p>
            </div>
          </div>

          {/* 營養素比例圖 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">營養素分配</p>
            <div className="h-8 flex rounded-lg overflow-hidden">
              <div
                className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(protein * 4 / dailyCalories) * 100}%` }}
              >
                蛋白質
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(carbs * 4 / dailyCalories) * 100}%` }}
              >
                碳水
              </div>
              <div
                className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(fat * 9 / dailyCalories) * 100}%` }}
              >
                脂肪
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 儲存按鈕 */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          取消
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? '儲存中...' : '儲存目標'}
        </Button>
      </div>

      {!profile?.height || !profile?.weight && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 提示: 請先完善個人資料（身高、體重、出生日期）以獲得更準確的目標建議
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/profile')}
              className="mt-2"
            >
              前往個人資料
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
