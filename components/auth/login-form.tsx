'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
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

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 從 URL 讀取 callbackUrl，過濾掉無效路徑（如 /auth/login）
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.startsWith('/auth/')
      ? rawCallbackUrl
      : '/dashboard';

  // 返回此頁時重置 loading 狀態（避免瀏覽器快取保留舊 state）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
    setError('');
  }, []);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth v5 將所有 credentials 錯誤統一為 "CredentialsSignin"
        // 加入驗證提示，涵蓋未驗證 Email 的情況
        setError('Email 或密碼錯誤。若您尚未驗證 Email，請先點擊註冊信中的驗證連結。');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">登入</h1>
        <p className="text-muted-foreground">
          輸入您的帳號資訊以登入
        </p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...form.register('rememberMe')}
                className="rounded border-gray-300"
              />
              記住我
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              忘記密碼？
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入'}
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
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <Icon icon="logos:google-icon" className="mr-2 h-4 w-4" />
        使用 Google 登入
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        還沒有帳號？{' '}
        <a href="/register" className="text-primary hover:underline">
          立即註冊
        </a>
      </p>
    </div>
  );
};
