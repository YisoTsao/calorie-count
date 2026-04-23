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

  // 從 URL 讀取 callbackUrl，過濾掉無效路徑
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.startsWith('/auth/')
      ? rawCallbackUrl
      : '/dashboard';

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

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  // 註冊成功 → 顯示驗證 Email 提示畫面
  if (registered) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Icon icon="mdi:email-check" className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">註冊成功！</h1>
          <p className="text-muted-foreground text-sm">
            我們已發送驗證信到 <strong>{registeredEmail}</strong>
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-300">
          請前往收件匣點擊驗證連結，驗證後即可登入。若未收到，請檢查垃圾郵件資料夾。
        </div>
        <Button onClick={() => router.push('/login')} className="w-full">
          前往登入
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">註冊</h1>
        <p className="text-muted-foreground">
          建立您的帳號以開始使用
        </p>
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
                  <Input
                    type="text"
                    placeholder="您的姓名"
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '註冊'}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            或使用
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <Icon icon="logos:google-icon" className="mr-2 h-4 w-4" />
        使用 Google 繼續
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        已經有帳號了？{' '}
        <a href="/login" className="text-primary hover:underline">
          立即登入
        </a>
      </p>
    </div>
  );
};
