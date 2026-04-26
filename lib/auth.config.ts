/**
 * Edge-compatible auth config (no Prisma, no bcryptjs).
 * Used by proxy.ts (Edge runtime) for route protection.
 */
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import LineProvider from 'next-auth/providers/line';
import CredentialsProvider from 'next-auth/providers/credentials';

// 支援的 locale 列表（非預設語言，預設 zh-TW 無前綴）
const NON_DEFAULT_LOCALES = ['en', 'ja'];

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

/** 去除 URL 開頭的 locale 前綴（如 /en/... → /...） */
function stripLocalePrefix(pathname: string): string {
  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/';
    }
  }
  return pathname;
}

/** 偵測 URL 中的 locale（非預設語言），若為預設語言則回傳 undefined */
function detectLocale(pathname: string): string | undefined {
  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return undefined;
}

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
      // 去除 locale 前綴後再比對路由
      const strippedPath = stripLocalePrefix(pathname);
      const locale = detectLocale(pathname);
      const localePrefix = locale ? `/${locale}` : '';

      const isPublicRoute = publicRoutes.some((r) => strippedPath.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => strippedPath.startsWith(r));

      // 已登入者不應進入 login/register
      if (isAuthRoute && auth?.user) {
        return Response.redirect(new URL(`${localePrefix}/dashboard`, request.nextUrl));
      }

      // 管理後台路由：需要登入（角色檢查由 server layout 負責，Edge 無法查 DB）
      const isAdminRoute = strippedPath.startsWith('/admin');
      if (isAdminRoute && !auth?.user) {
        return Response.redirect(
          new URL(`${localePrefix}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.nextUrl)
        );
      }

      // 未登入者不能訪問私有路由
      if (!isPublicRoute && !auth?.user) {
        return false;
      }

      return true;
    },
  },
};
