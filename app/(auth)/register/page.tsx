import { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '註冊 | AI 卡路里追蹤',
  description: '建立新帳號開始您的健康之旅',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            建立帳號
          </CardTitle>
          <CardDescription className="text-center">
            開始您的健康飲食追蹤之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
