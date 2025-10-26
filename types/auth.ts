/**
 * 認證相關型別定義
 */

import type { DefaultSession } from 'next-auth';

// 擴展 NextAuth Session 型別
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}

// 擴展 NextAuth JWT 型別
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
    provider?: string;
  }
}

// 登入請求
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 註冊請求
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 重設密碼請求
export interface ResetPasswordRequest {
  email: string;
}

// 更新密碼請求
export interface UpdatePasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Email 驗證請求
export interface VerifyEmailRequest {
  token: string;
}

// 認證回應
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
  message?: string;
}
