'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Target, TrendingUp, Droplet } from 'lucide-react';

interface StatsCardProps {
  stats: {
    bmi?: number;
    bmiCategory?: string;
    bmr?: number;
    tdee?: number;
    recommendedCalories?: number;
    recommendedMacros?: {
      protein: number;
      carbs: number;
      fat: number;
    };
    idealWeightRange?: {
      min: number;
      max: number;
    };
    profileCompleteness?: number;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
  const getBMIColor = (category?: string) => {
    switch (category) {
      case 'UNDERWEIGHT':
        return 'text-blue-600';
      case 'NORMAL':
        return 'text-green-600';
      case 'OVERWEIGHT':
        return 'text-yellow-600';
      case 'OBESE':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBMILabel = (category?: string) => {
    switch (category) {
      case 'UNDERWEIGHT':
        return '過輕';
      case 'NORMAL':
        return '正常';
      case 'OVERWEIGHT':
        return '過重';
      case 'OBESE':
        return '肥胖';
      default:
        return '未知';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>健康統計</CardTitle>
        <CardDescription>您的健康指標與建議</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Completeness */}
        {stats.profileCompleteness !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">個人資料完整度</p>
              <span className="text-sm text-muted-foreground">
                {stats.profileCompleteness}%
              </span>
            </div>
            <Progress value={stats.profileCompleteness} className="h-2" />
          </div>
        )}

        {/* BMI */}
        {stats.bmi && (
          <div className="flex items-start space-x-3">
            <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">身體質量指數 (BMI)</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold">{stats.bmi.toFixed(1)}</span>
                <span className={`text-sm font-medium ${getBMIColor(stats.bmiCategory)}`}>
                  {getBMILabel(stats.bmiCategory)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ideal Weight Range */}
        {stats.idealWeightRange && (
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">理想體重範圍</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.idealWeightRange.min.toFixed(1)} - {stats.idealWeightRange.max.toFixed(1)} kg
              </p>
            </div>
          </div>
        )}

        {/* BMR & TDEE */}
        {stats.bmr && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">基礎代謝率 (BMR)</p>
              <p className="text-lg font-semibold">{Math.round(stats.bmr)} kcal</p>
            </div>
            {stats.tdee && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">每日總消耗 (TDEE)</p>
                <p className="text-lg font-semibold">{Math.round(stats.tdee)} kcal</p>
              </div>
            )}
          </div>
        )}

        {/* Recommended Calories */}
        {stats.recommendedCalories && (
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">建議每日攝取</p>
              <p className="text-2xl font-bold mt-1">{Math.round(stats.recommendedCalories)} kcal</p>
            </div>
          </div>
        )}

        {/* Macronutrients */}
        {stats.recommendedMacros && (
          <div>
            <p className="text-sm font-medium mb-3">巨量營養素建議</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">蛋白質</span>
                  <span className="text-xs font-medium">{Math.round(stats.recommendedMacros.protein)}g</span>
                </div>
                <Progress 
                  value={(stats.recommendedMacros.protein / (stats.recommendedMacros.protein + stats.recommendedMacros.carbs + stats.recommendedMacros.fat)) * 100} 
                  className="h-2 bg-blue-100"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">碳水化合物</span>
                  <span className="text-xs font-medium">{Math.round(stats.recommendedMacros.carbs)}g</span>
                </div>
                <Progress 
                  value={(stats.recommendedMacros.carbs / (stats.recommendedMacros.protein + stats.recommendedMacros.carbs + stats.recommendedMacros.fat)) * 100} 
                  className="h-2 bg-green-100"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">脂肪</span>
                  <span className="text-xs font-medium">{Math.round(stats.recommendedMacros.fat)}g</span>
                </div>
                <Progress 
                  value={(stats.recommendedMacros.fat / (stats.recommendedMacros.protein + stats.recommendedMacros.carbs + stats.recommendedMacros.fat)) * 100} 
                  className="h-2 bg-yellow-100"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
