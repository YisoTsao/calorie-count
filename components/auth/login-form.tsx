'use client';

import React, { useState } from 'react';
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
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // 從 URL 讀取 callbackUrl
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.startsWith('/auth/') ? rawCallbackUrl : '/dashboard';

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
        setError('Email 或密碼錯誤。若您尚未驗證 Email，請先點擊註冊信中的驗證連結。');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('登入時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-6 space-y-1 text-center">
        <h2 className="text-xl font-semibold text-gray-900">歡迎回來</h2>
        <p className="text-sm text-gray-500">選擇登入方式繼續使用</p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          onClick={() => handleOAuth('google')}
          disabled={isLoading}
        >
          <Icon icon="logos:google-icon" className="mr-3 h-5 w-5" />
          使用 Google 繼續
        </Button>

        {process.env.NEXT_PUBLIC_FACEBOOK_ENABLED === 'true' && (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => handleOAuth('facebook')}
            disabled={isLoading}
          >
            <Icon icon="logos:facebook" className="mr-3 h-5 w-5" />
            使用 Facebook 繼續
          </Button>
        )}

        {process.env.NEXT_PUBLIC_LINE_ENABLED === 'true' && (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-[#00B900]/30 bg-white font-medium text-gray-700 shadow-sm hover:bg-[#00B900]/5"
            onClick={() => handleOAuth('line')}
            disabled={isLoading}
          >
            <Icon icon="simple-icons:line" className="mr-3 h-5 w-5 text-[#00B900]" />
            使用 LINE 繼續
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setShowCredentials((v) => !v)}
            className="inline-flex items-center gap-1 bg-white px-3 text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            <Mail className="h-3.5 w-3.5" />
            使用 Email 登入
            {showCredentials ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Credentials (collapsible) */}
      {showCredentials && (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-600">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        disabled={isLoading}
                        className="h-10 rounded-xl border-gray-200 bg-white"
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs text-gray-600">密碼</FormLabel>
                      <a href="/forgot-password" className="text-xs text-primary hover:underline">
                        忘記密碼？
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="h-10 rounded-xl border-gray-200 bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="h-10 w-full rounded-xl" disabled={isLoading}>
                {isLoading ? '登入中...' : '登入'}
              </Button>
            </form>
          </Form>
        </div>
      )}

      <p className="pt-2 text-center text-sm text-gray-500">
        還沒有帳號？{' '}
        <a href="/register" className="font-medium text-primary hover:underline">
          立即註冊
        </a>
      </p>
    </div>
  );
};
