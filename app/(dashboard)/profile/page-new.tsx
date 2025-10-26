import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileCard } from '@/components/profile/profile-card';
import { StatsCard } from '@/components/profile/stats-card';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { Button } from '@/components/ui/button';
import { Edit, Target, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, goals: true, preferences: true },
  });

  if (!user) redirect('/auth/login');

  // Mock stats - 實際應該從 API 取得
  const stats = {
    profileCompleteness: 75,
    bmi: user.profile?.height && user.profile?.weight 
      ? user.profile.weight / ((user.profile.height / 100) ** 2)
      : undefined,
    bmiCategory: 'NORMAL',
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">個人資料</h1>
          <p className="text-muted-foreground">管理您的帳號設定與健康資訊</p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              編輯資料
            </Button>
          </Link>
          <Link href="/profile/goals">
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              目標設定
            </Button>
          </Link>
          <Link href="/profile/preferences">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              偏好設定
            </Button>
          </Link>
          <Link href="/profile/security">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              安全設定
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileCard user={user} />
        </div>
        <div className="space-y-6">
          <AvatarUpload currentImage={user.image} userName={user.name} />
          <StatsCard stats={stats} />
        </div>
      </div>
    </div>
  );
}
