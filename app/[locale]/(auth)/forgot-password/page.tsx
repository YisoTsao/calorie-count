import type { Metadata } from 'next';
import { ForgotPasswordClient } from './_client';

/** 忘記密碼頁不具備 SEO 價值，明確排除索引 */
export const metadata: Metadata = {
  title: '忘記密碼 | CalorieCount',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
