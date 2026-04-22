/**
 * proxy.ts — Next.js 16+ 路由守衛（取代 middleware.ts）
 * 只能使用 Edge-compatible 模組。
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// 必須明確傳入 secret，確保與 lib/auth.ts 主實例使用相同金鑰解密 session cookie。
// NextAuth v5 預設讀取 AUTH_SECRET，但本專案使用 NEXTAUTH_SECRET。
export const { auth: proxy } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

export default proxy;

export const config = {
  matcher: [
    // 排除靜態資源、圖片及 /api/auth（OAuth callback 路徑），其餘全部保護
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
