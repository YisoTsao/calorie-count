'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { createRegisterSchema, type RegisterInput } from '@/lib/validations/auth';
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
  const t = useTranslations('auth.register');
  const tv = useTranslations('validation');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.startsWith('/auth/') ? rawCallbackUrl : '/dashboard';

  const schema = useMemo(
    () =>
      createRegisterSchema({
        emailInvalid: tv('emailInvalid'),
        passwordMin: tv('passwordMin'),
        passwordUpperCase: tv('passwordUpperCase'),
        passwordLowerCase: tv('passwordLowerCase'),
        passwordNumber: tv('passwordNumber'),
        nameRequired: tv('nameRequired'),
        passwordMismatch: tv('passwordMismatch'),
      }),
    [tv]
  );

  const form = useForm<RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setError(t('errors.emailExists'));
        } else {
          setError(result.error?.message || t('errors.generic'));
        }
        return;
      }
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch {
      setError(t('errors.generic'));
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
        setResendMessage(data.data?.message || t('emailVerification.resendApiSuccess'));
      } else {
        setResendStatus('error');
        setResendMessage(data.error?.message || t('emailVerification.resendApiFailed'));
      }
    } catch {
      setResendStatus('error');
      setResendMessage(t('emailVerification.resendApiFailed'));
    }
  };

  if (registered) {
    return (
      <div className="w-full space-y-5">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Icon icon="mdi:email-check" className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t('emailVerification.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('emailVerification.desc')}{' '}
            <strong className="text-foreground">{registeredEmail}</strong>
          </p>
        </div>

        <div className="space-y-1 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <p className="font-medium">{t('emailVerification.stepsTitle')}</p>
          <ol className="list-inside list-decimal space-y-1 text-blue-600 dark:text-blue-400">
            <li>{t('emailVerification.step1')}</li>
            <li>{t('emailVerification.step2')}</li>
            <li>{t('emailVerification.step3')}</li>
          </ol>
          <p className="mt-2 text-xs text-blue-500">{t('emailVerification.expiryNote')}</p>
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
          {t('emailVerification.goToLogin')}
        </Button>
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          onClick={handleResend}
        >
          {resendStatus === 'sending'
            ? t('emailVerification.resending')
            : resendStatus === 'sent'
              ? t('emailVerification.resent')
              : t('emailVerification.resend')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t('namePlaceholder')} disabled={isLoading} {...field} />
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
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" disabled={isLoading} {...field} />
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
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('passwordPlaceholder')} disabled={isLoading} {...field} />
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
                <FormLabel>{t('confirmPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('confirmPasswordPlaceholder')} disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
            {isLoading ? t('submitting') : t('submit')}
          </Button>

          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 accent-primary"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              {t('agreeTerms')}{' '}
              <a href="/terms" className="text-primary underline underline-offset-2 hover:no-underline">
                {t('termsLink')}
              </a>{' '}
              與{' '}
              <a href="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
                {t('privacyLink')}
              </a>
              {t('agreeTermsSuffix')}
            </span>
          </label>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t('orContinueWithSocial')}</span>
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
          {t('withGoogle')}
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
            {t('withFacebook')}
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
            {t('withLine')}
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <a href="/login" className="text-primary hover:underline">
          {t('loginLink')}
        </a>
      </p>
    </div>
  );
};

