'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/error-message';
import { Icon } from '@iconify/react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>(
    token ? 'loading' : 'no-token'
  );
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.data?.message || 'Email 驗證成功！');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Email 驗證失敗');
          if (data.error?.code === 'EXPIRED') setIsExpired(true);
        }
      } catch {
        setStatus('error');
        setMessage('驗證過程發生錯誤，請稍後再試');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendStatus('sending');
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('sent');
        setResendMessage(data.data?.message || '驗證信已重新發送');
      } else {
        setResendStatus('error');
        setResendMessage(data.error?.message || '發送失敗，請稍後再試');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('發送失敗，請稍後再試');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Email 驗證</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? '正在驗證您的 Email 地址' : 'CalorieCount 帳號驗證'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-center text-muted-foreground">正在驗證中...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon icon="mdi:check-circle" className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-1 text-center">
                <p className="font-semibold text-green-600">{message}</p>
                <p className="text-sm text-muted-foreground">即將自動跳轉到登入頁面...</p>
              </div>
              <Button onClick={() => router.push('/login')} className="w-full">
                立即前往登入
              </Button>
            </div>
          )}

          {(status === 'error' || status === 'no-token') && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <Icon icon="mdi:email-alert" className="h-8 w-8 text-red-500" />
                </div>
                {message && <ErrorMessage message={message} type="error" />}
              </div>

              {/* 重新發送 section（token 過期或缺少 token 時顯示） */}
              {(isExpired || status === 'no-token') && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">重新發送驗證信</p>
                  <Input
                    type="email"
                    placeholder="請輸入您的 Email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={resendStatus === 'sent'}
                    className="h-10 bg-white"
                  />
                  {resendMessage && (
                    <p
                      className={`text-xs ${resendStatus === 'sent' ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {resendMessage}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={!resendEmail || resendStatus === 'sending' || resendStatus === 'sent'}
                  >
                    {resendStatus === 'sending'
                      ? '發送中...'
                      : resendStatus === 'sent'
                        ? '✓ 已發送'
                        : '重新發送驗證信'}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={() => router.push('/login')} className="w-full">
                  前往登入
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                >
                  重新註冊
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
