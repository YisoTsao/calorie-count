import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const tm = await getTranslations('dashboard');
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/profile/edit">
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            {t('editProfile')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
            <CardDescription>{t('basicInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{t('name')}</p>
              <p className="text-sm text-muted-foreground">{user.name || t('notSet')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('email')}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('emailStatus')}</p>
              <p className="text-sm text-muted-foreground">
                {user.emailVerified ? t('verified') : t('unverified')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('bodyData')}</CardTitle>
            <CardDescription>{t('bodyDataDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{t('height')}</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.height ? `${user.profile.height} cm` : t('notSet')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('weight')}</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.weight ? `${user.profile.weight} kg` : t('notSet')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('targetWeight')}</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.targetWeight ? `${user.profile.targetWeight} kg` : t('notSet')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('activityLevel')}</p>
              <p className="text-sm text-muted-foreground">
                {user.profile?.activityLevel || t('notSet')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dailyGoals')}</CardTitle>
            <CardDescription>{t('dailyGoalsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{tm('calorieProgress')}</p>
              <p className="text-sm text-muted-foreground">
                {user.goals?.dailyCalorieGoal || 2000} kcal
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{tm('macros.protein')}</p>
              <p className="text-sm text-muted-foreground">{user.goals?.proteinGoal || 50} g</p>
            </div>
            <div>
              <p className="text-sm font-medium">{tm('macros.carbs')}</p>
              <p className="text-sm text-muted-foreground">{user.goals?.carbsGoal || 250} g</p>
            </div>
            <div>
              <p className="text-sm font-medium">{tm('macros.fat')}</p>
              <p className="text-sm text-muted-foreground">{user.goals?.fatGoal || 65} g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('preferences')}</CardTitle>
            <CardDescription>{t('preferencesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{t('theme')}</p>
              <p className="text-sm text-muted-foreground">{user.preferences?.theme || 'LIGHT'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('language')}</p>
              <p className="text-sm text-muted-foreground">
                {user.preferences?.language || 'zh-TW'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('units')}</p>
              <p className="text-sm text-muted-foreground">{user.preferences?.units || 'METRIC'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
