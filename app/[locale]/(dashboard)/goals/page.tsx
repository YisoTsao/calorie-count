'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
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
  {
    value: 'LOSE_WEIGHT',
    labelKey: 'goalTypes.loseWeight',
    icon: TrendingDown,
    color: 'text-blue-600',
  },
  { value: 'MAINTAIN', labelKey: 'goalTypes.maintain', icon: Minus, color: 'text-green-600' },
  {
    value: 'GAIN_WEIGHT',
    labelKey: 'goalTypes.gainWeight',
    icon: TrendingUp,
    color: 'text-orange-600',
  },
];

export default function GoalsPage() {
  const t = useTranslations('goals');
  const tc = useTranslations('common');
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
  const [waterGoal, setWaterGoal] = useState(2000);
  const [targetWeight, setTargetWeight] = useState<number | ''>('');

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
          if (data.data.goals.waterGoal) setWaterGoal(data.data.goals.waterGoal);
        }
        if (data.data.profile?.targetWeight) {
          setTargetWeight(data.data.profile.targetWeight);
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
      alert(t('incompleteProfile'));
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

    alert(
      `✅ ${t('calculateDesc')}\n\nBMR: ${recommendations.bmr} kcal\nTDEE: ${recommendations.tdee} kcal`
    );
  };

  // 儲存目標
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const requests: Promise<Response>[] = [
        fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalType,
            dailyCalorieGoal: dailyCalories,
            proteinGoal: protein,
            carbsGoal: carbs,
            fatGoal: fat,
            waterGoal,
          }),
        }),
      ];

      if (targetWeight !== '') {
        requests.push(
          fetch('/api/users/me/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetWeight }),
          })
        );
      }

      const results = await Promise.all(requests);
      if (!results.every((r) => r.ok)) throw new Error('儲存失敗');

      alert('✅ ' + t('saveSuccess'));
      router.push('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      alert(t('saveError'));
      setIsSaving(false);
    }
  };

  // 計算 BMI 和健康體重範圍
  const bmi =
    profile?.height && profile?.weight ? calculateBMI(profile.weight, profile.height) : null;

  const healthyRange = profile?.height ? getHealthyWeightRange(profile.height) : null;

  const weeksToGoal =
    profile?.weight && profile?.targetWeight && goalType !== 'MAINTAIN'
      ? estimateWeeksToGoal(profile.weight, profile.targetWeight, goalType)
      : null;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        {/* 頁首 */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-48" />
        </div>
        {/* BMI 資訊卡 */}
        <Skeleton className="h-36 w-full rounded-xl" />
        {/* 目標類型選擇 */}
        <Skeleton className="h-24 w-full rounded-xl" />
        {/* 每日營養目標 */}
        <div className="space-y-4 rounded-xl border p-6">
          <Skeleton className="h-6 w-32" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        {/* 儲存按鈕 */}
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* 頁首 */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Target className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* BMI 資訊卡片 */}
      {bmi && (
        <Card>
          <CardHeader>
            <CardTitle>{t('healthMetrics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">{t('currentBmi')}</p>
                <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{getBMICategory(bmi)}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">{t('currentWeight')}</p>
                <p className="text-2xl font-bold">{profile?.weight} kg</p>
                {profile?.targetWeight && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('targetWeight')}: {profile.targetWeight} kg
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">{t('recommendedRange')}</p>
                <p className="text-xl font-bold">
                  {healthyRange?.min} - {healthyRange?.max} kg
                </p>
                <p className="mt-1 text-xs text-muted-foreground">BMI 18.5-24</p>
              </div>
            </div>

            {weeksToGoal && (
              <div className="text-center text-sm text-muted-foreground">
                {t('estimatedWeeks', { weeks: weeksToGoal })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 目標類型選擇 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('goalType')}</CardTitle>
          <CardDescription>{t('goalTypeDesc')}</CardDescription>
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
                  className={`rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-2 h-8 w-8 ${isSelected ? 'text-primary' : option.color}`}
                  />
                  <p className="font-medium">{t(option.labelKey)}</p>
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
              <CardTitle>{t('dailyNutrition')}</CardTitle>
              <CardDescription>{t('dailyNutritionDesc')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={calculateRecommendedGoals}
              disabled={!profile?.height || !profile?.weight}
            >
              <Calculator className="mr-2 h-4 w-4" />
              {t('autoCalculate')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="calories">{t('calories')}</Label>
            <Input
              id="calories"
              type="number"
              value={dailyCalories}
              onChange={(e) => setDailyCalories(Number(e.target.value))}
              min={1000}
              max={5000}
              step={50}
            />
            <p className="text-xs text-muted-foreground">{t('caloriesRange')}</p>
          </div>

          {/* 飲水目標 + 目標體重 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="water">{t('water')}</Label>
              <Input
                id="water"
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                min={0}
                max={10000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">{t('waterRange')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">{t('targetWeight')}</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) =>
                  setTargetWeight(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder={profile?.weight ? String(profile.weight) : '68.0'}
              />
              <p className="text-xs text-muted-foreground">{t('saveToProfile')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="protein">{t('protein')}</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                min={0}
                max={500}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(((protein * 4) / dailyCalories) * 100)}
                {t('caloriesPct')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">{t('carbs')}</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                min={0}
                max={1000}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(((carbs * 4) / dailyCalories) * 100)}
                {t('caloriesPct')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">{t('fat')}</Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                min={0}
                max={300}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(((fat * 9) / dailyCalories) * 100)}
                {t('caloriesPct')}
              </p>
            </div>
          </div>

          {/* 營養素比例圖 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('nutritionDist')}</p>
            <div className="flex h-8 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-red-500 text-xs font-medium text-white"
                style={{ width: `${((protein * 4) / dailyCalories) * 100}%` }}
              >
                {t('proteinLabel')}
              </div>
              <div
                className="flex items-center justify-center bg-blue-500 text-xs font-medium text-white"
                style={{ width: `${((carbs * 4) / dailyCalories) * 100}%` }}
              >
                {t('carbsLabel')}
              </div>
              <div
                className="flex items-center justify-center bg-yellow-500 text-xs font-medium text-white"
                style={{ width: `${((fat * 9) / dailyCalories) * 100}%` }}
              >
                {t('fatLabel')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 儲存按鈕 */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          {tc('cancel')}
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? tc('saving') : t('saveGoals')}
        </Button>
      </div>

      {!profile?.height ||
        (!profile?.weight && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 {t('incompleteProfile')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
                className="mt-2"
              >
                {t('goToProfile')}
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
