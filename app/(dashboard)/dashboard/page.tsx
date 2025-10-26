import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            歡迎回來, {session?.user?.name || '使用者'}!
          </h1>
          <p className="text-muted-foreground">
            這是您的卡路里追蹤儀表板
          </p>
        </div>
        <Link href="/scan">
          <Button size="lg">
            <Scan className="h-5 w-5 mr-2" />
            快速掃描
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今日攝取
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 kcal</div>
            <p className="text-xs text-muted-foreground">
              目標: 2000 kcal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              蛋白質
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0g</div>
            <p className="text-xs text-muted-foreground">
              目標: 50g
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              碳水化合物
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0g</div>
            <p className="text-xs text-muted-foreground">
              目標: 250g
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              脂肪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0g</div>
            <p className="text-xs text-muted-foreground">
              目標: 65g
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>今日飲食記錄</CardTitle>
            <CardDescription>
              您今天還沒有記錄任何飲食
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              開始記錄您的第一餐吧！
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>每週進度</CardTitle>
            <CardDescription>
              查看您的每週飲食趨勢
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              尚無足夠數據
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
