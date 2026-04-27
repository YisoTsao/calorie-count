'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ErrorMessage } from '@/components/ui/error-message';
import { Icon } from '@iconify/react';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 從 URL 讀取 callbackUrl，過濾掉無效路徑
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.startsWith('/auth/') ? rawCallbackUrl : '/dashboard';

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // 409 Conflict = email 已被使用
        if (response.status === 409) {
          setError('此 Email 已被註冊，請直接登入或使用其他 Email。');
        } else {
          setError(result.error?.message || '註冊失敗，請稍後再試');
        }
        return;
      }

      // 註冊成功 → 顯示驗證 Email 提示（不自動登入，因信箱尚未驗證）
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch {
      setError('註冊時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  const handleResend = async () => {
    setResendStatus('sending');
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
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

  // 註冊成功 → 顯示驗證 Email 提示畫面
  if (registered) {
    return (
      <div className="w-full space-y-5">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Icon
                icon="mdi:email-check"
                className="h-10 w-10 text-green-600 dark:text-green-400"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">驗證信已發送！</h1>
          <p className="text-sm text-muted-foreground">
            我們已發送驗證信到 <strong className="text-foreground">{registeredEmail}</strong>
          </p>
        </div>

        <div className="space-y-1 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <p className="font-medium">請完成以下步驟：</p>
          <ol className="list-inside list-decimal space-y-1 text-blue-600 dark:text-blue-400">
            <li>前往您的信箱查收驗證信</li>
            <li>點擊信中的「驗證 Email」按鈕</li>
            <li>驗證完成後即可登入</li>
          </ol>
          <p className="mt-2 text-xs text-blue-500">
            若未收到，請查看垃圾郵件資料夾。連結 24 小時內有效。
          </p>
        </div>

        {resendMessage && (
          <div
            className={`rounded-lg p-2 text-center text-sm ${
              resendStatus === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {resendMessage}
          </div>
        )}

        <Button onClick={() => router.push('/login')} className="w-full">
          前往登入
        </Button>
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          onClick={handleResend}
        >
          {resendStatus === 'sending'
            ? '發送中...'
            : resendStatus === 'sent'
              ? '✓ 已重新發送'
              : '沒收到驗證信？重新發送'}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">註冊</h1>
        <p className="text-muted-foreground">建立您的帳號以開始使用</p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>姓名</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="您的姓名" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密碼</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="至少 8 個字元"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>確認密碼</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="再次輸入密碼"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
            {isLoading ? '註冊中...' : '建立帳號'}
          </Button>

          {/* 條款同意 */}
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 accent-primary"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              我已閱讀並同意{' '}
              <a
                href="/terms"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                服務條款
              </a>{' '}
              與{' '}
              <a
                href="/privacy"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                隱私權政策
              </a>
              ，包括本系統對個人健康資料的收集與使用方式。
            </span>
          </label>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">或使用社群帳號註冊</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          onClick={() => handleOAuth('google')}
          disabled={isLoading}
        >
          <Icon icon="logos:google-icon" className="mr-3 h-5 w-5 flex-shrink-0" />
          使用 Google 繼續
        </Button>

        {process.env.NEXT_PUBLIC_FACEBOOK_ENABLED === 'true' && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => handleOAuth('facebook')}
            disabled={isLoading}
          >
            <Icon icon="logos:facebook" className="mr-3 h-5 w-5 flex-shrink-0" />
            使用 Facebook 繼續
          </Button>
        )}

        {process.env.NEXT_PUBLIC_LINE_ENABLED === 'true' && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-[#00B900]/30 bg-white font-medium text-gray-700 shadow-sm hover:bg-[#00B900]/5"
            onClick={() => handleOAuth('line')}
            disabled={isLoading}
          >
            <Icon icon="simple-icons:line" className="mr-3 h-5 w-5 flex-shrink-0 text-[#00B900]" />
            使用 LINE 繼續
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        已經有帳號了？{' '}
        <a href="/login" className="text-primary hover:underline">
          立即登入
        </a>
      </p>
    </div>
  );
};
