'use client';

import { User } from 'next-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, User as UserIcon } from 'lucide-react';

interface ProfileCardProps {
  user: User & {
    profile?: {
      height?: number | null;
      weight?: number | null;
      gender?: string | null;
      birthDate?: Date | null;
    } | null;
    goals?: {
      goalType?: string | null;
      targetWeight?: number | null;
    } | null;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const age = user.profile?.birthDate
    ? new Date().getFullYear() - new Date(user.profile.birthDate).getFullYear()
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>個人資料</CardTitle>
        <CardDescription>您的基本資訊概覽</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{user.name || '未命名使用者'}</h3>
            <p className="mt-1 flex items-center text-sm text-muted-foreground">
              <Mail className="mr-1 h-4 w-4" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-2 gap-4">
          {user.profile?.gender && (
            <div className="flex items-start space-x-2">
              <UserIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">性別</p>
                <p className="text-sm text-muted-foreground">
                  {user.profile.gender === 'MALE'
                    ? '男性'
                    : user.profile.gender === 'FEMALE'
                      ? '女性'
                      : '其他'}
                </p>
              </div>
            </div>
          )}

          {age && (
            <div className="flex items-start space-x-2">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">年齡</p>
                <p className="text-sm text-muted-foreground">{age} 歲</p>
              </div>
            </div>
          )}

          {user.profile?.height && (
            <div>
              <p className="text-sm font-medium">身高</p>
              <p className="text-sm text-muted-foreground">{user.profile.height} cm</p>
            </div>
          )}

          {user.profile?.weight && (
            <div>
              <p className="text-sm font-medium">體重</p>
              <p className="text-sm text-muted-foreground">{user.profile.weight} kg</p>
            </div>
          )}
        </div>

        {/* Goal Badge */}
        {user.goals?.goalType && (
          <div>
            <p className="mb-2 text-sm font-medium">目標</p>
            <Badge variant="secondary">
              {user.goals.goalType === 'LOSE_WEIGHT'
                ? '減重'
                : user.goals.goalType === 'BUILD_MUSCLE'
                  ? '增肌'
                  : user.goals.goalType === 'MAINTAIN_WEIGHT'
                    ? '維持'
                    : '健康'}
              {user.goals.targetWeight && (
                <span className="ml-1">→ {user.goals.targetWeight} kg</span>
              )}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
