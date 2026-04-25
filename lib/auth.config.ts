/**
 * Edge-compatible auth config (no Prisma, no bcryptjs).
 * Used by proxy.ts (Edge runtime) for route protection.
 */
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import LineProvider from 'next-auth/providers/line';
import CredentialsProvider from 'next-auth/providers/credentials';

// 公開路由（不需要登入）
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/complete-profile',
];
// 已登入後不應再訪問的路由
const authRoutes = ['/login', '/register'];

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/dashboard',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // 允許已有 credentials 帳號的 email 透過 Google 登入（帳號合併）
      allowDangerousEmailAccountLinking: true,
    }),
    // Facebook Login（需設定 FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET）
    ...(process.env.FACEBOOK_CLIENT_ID
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // LINE Login（需設定 LINE_CLIENT_ID / LINE_CLIENT_SECRET）
    ...(process.env.LINE_CLIENT_ID
      ? [
          LineProvider({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET ?? '',
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // CredentialsProvider 在 Edge 不能做 DB 查詢，只宣告佔位
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize 在 Edge proxy 不執行，實際邏輯在 lib/auth.ts
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

      // 已登入者不應進入 login/register
      if (isAuthRoute && auth?.user) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      // 未登入者不能訪問私有路由
      if (!isPublicRoute && !auth?.user) {
        return false;
      }

      return true;
    },
  },
};
