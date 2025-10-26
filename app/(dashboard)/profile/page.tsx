import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileCard } from '@/components/profile/profile-card';
import { StatsCard } from '@/components/profile/stats-card';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      goals: true,
      preferences: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          個人資料
        </h1>
        <p className="text-muted-foreground">
          管理您的個人資訊和偏好設定
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
            <CardDescription>
              您的帳號基本資料
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">姓名</p>
              <p className="text-sm text-muted-foreground">{user.name || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email 驗證狀態</p>
              <p className="text-sm text-muted-foreground">
                {user.emailVerified ? '已驗證' : '未驗證'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>身體數據</CardTitle>
            <CardDescription>
              您的身高、體重等資訊
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">身高</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.height ? `${user.profile.height} cm` : '未設定'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">體重</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.weight ? `${user.profile.weight} kg` : '未設定'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">目標體重</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.targetWeight ? `${user.profile.targetWeight} kg` : '未設定'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">活動量</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.activityLevel || '未設定'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>每日目標</CardTitle>
            <CardDescription>
              您的營養攝取目標
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">卡路里</p>
              <p className="text-sm text-muted-foreground">
                {user.goals?.dailyCalorieGoal || 2000} kcal
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">蛋白質</p>
              <p className="text-sm text-muted-foreground">
                {user.goals?.proteinGoal || 50} g
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">碳水化合物</p>
              <p className="text-sm text-muted-foreground">
                {user.goals?.carbsGoal || 250} g
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">脂肪</p>
              <p className="text-sm text-muted-foreground">
                {user.goals?.fatGoal || 65} g
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>偏好設定</CardTitle>
            <CardDescription>
              應用程式設定
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">主題</p>
              <p className="text-sm text-muted-foreground">
                {user.preferences?.theme || 'LIGHT'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">語言</p>
              <p className="text-sm text-muted-foreground">
                {user.preferences?.language || 'zh-TW'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">單位</p>
              <p className="text-sm text-muted-foreground">
                {user.preferences?.units || 'METRIC'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
