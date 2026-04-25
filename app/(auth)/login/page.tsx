import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: '登入 | AI 卡路里追蹤',
  description: '登入您的帳號以開始追蹤卡路里',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
        {/* Logo / Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-emerald-200">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-gray-900">CalorieCount</h1>
        <p className="mb-10 text-sm text-gray-500">AI 智能飲食管理，從今天開始健康生活</p>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center text-xs text-gray-400">
        <p>
          繼續即代表您同意我們的{' '}
          <a href="/terms" className="text-gray-500 underline underline-offset-2">
            服務條款
          </a>{' '}
          與{' '}
          <a href="/privacy" className="text-gray-500 underline underline-offset-2">
            隱私政策
          </a>
        </p>
      </div>
    </div>
  );
}
