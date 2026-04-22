import { auth } from '@/lib/auth';

export default auth;

export const config = {
  matcher: [
    /*
     * 排除以下路徑：
     *   - _next/static / _next/image / favicon.ico / 靜態圖片
     * 其餘路徑都跑 NextAuth middleware（route protection + session refresh）
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

