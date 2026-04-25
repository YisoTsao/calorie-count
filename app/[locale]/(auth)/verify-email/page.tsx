'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Icon } from '@iconify/react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('缺少驗證 token');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.data?.message || 'Email 驗證成功！');
          
          // 3 秒後自動跳轉到登入頁面
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Email 驗證失敗');
        }
      } catch {
        setStatus('error');
        setMessage('驗證過程發生錯誤，請稍後再試');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Email 驗證
          </CardTitle>
          <CardDescription className="text-center">
            正在驗證您的 Email 地址
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-center text-muted-foreground">
                正在驗證中...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Icon
                  icon="mdi:check-circle"
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground">
                  即將自動跳轉到登入頁面...
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                立即前往登入
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <ErrorMessage message={message} type="error" />
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/register')}
                  className="w-full"
                  variant="outline"
                >
                  返回註冊頁面
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  前往登入頁面
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
