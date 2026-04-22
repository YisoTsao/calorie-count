/**
 * proxy.ts — Next.js 16+ 路由守衛（取代 middleware.ts）
 * 只能使用 Edge-compatible 模組。
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
