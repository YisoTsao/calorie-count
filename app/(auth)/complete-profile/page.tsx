'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || '更新失敗，請稍後再試');
        return;
      }

      // 發送驗證信
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setSent(true);
    } catch {
      setError('發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Icon icon="mdi:email-check" className="h-9 w-9 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">驗證信已發送</h2>
          <p className="text-sm text-gray-500">
            請前往 <strong className="text-gray-800">{email}</strong>{' '}
            查收驗證信，完成後即可使用全部功能。
          </p>
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            稍後再驗證，先進入首頁
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Icon icon="mdi:email-plus" className="h-9 w-9 text-amber-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">補充 Email 地址</h2>
          <p className="text-sm text-gray-500">
            您使用的登入方式未提供 Email，請補充以啟用密碼重設、重要通知等功能。
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-12 rounded-xl"
            required
          />
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={isLoading}>
            {isLoading ? '儲存中...' : '儲存並發送驗證信'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full text-center text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          略過，稍後再設定
        </button>
      </div>
    </div>
  );
}
