import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 清除 NextAuth cookies
    const cookieStore = await cookies();

    // NextAuth 使用的 cookie 名稱
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token',
    ];

    // 刪除所有相關 cookies
    cookieNames.forEach((name) => {
      cookieStore.delete(name);
    });

    return NextResponse.json(
      { success: true, message: '成功登出' },
      {
        status: 200,
        headers: {
          'Clear-Site-Data': '"cookies"',
        },
      }
    );
  } catch (error) {
    console.error('登出失敗:', error);
    return NextResponse.json({ success: false, error: '登出失敗' }, { status: 500 });
  }
}
