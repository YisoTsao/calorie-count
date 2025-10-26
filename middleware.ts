import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 公開路由 (不需要登入)
const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password'];

// 認證路由 (已登入用戶不應訪問)
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 獲取 session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // 檢查是否為公開路由
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 檢查是否為認證路由
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 如果是認證路由且已登入，重定向到 dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 如果不是公開路由且未登入，重定向到 login
  if (!isPublicRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

// 配置 middleware 要匹配的路徑
export const config = {
  matcher: [
    /*
     * 匹配所有路徑除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (由各 route 自行處理認證)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
