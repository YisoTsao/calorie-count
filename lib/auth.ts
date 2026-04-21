import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請提供 Email 和密碼');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 驗證輸入格式
        const result = loginSchema.safeParse({
          email,
          password,
        });

        if (!result.success) {
          throw new Error('Email 或密碼格式不正確');
        }

        // 查詢用戶
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          throw new Error('Email 或密碼錯誤');
        }

        // 驗證密碼
        const isPasswordValid = await compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Email 或密碼錯誤');
        }

        // 檢查 Email 是否已驗證
        if (!user.emailVerified) {
          throw new Error('請先驗證您的 Email');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // 新增 authorized callback 取代 middleware
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      
      // 公開路由 (不需要登入)
      const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password'];
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
      
      // 認證路由 (已登入用戶不應訪問)
      const authRoutes = ['/login', '/register'];
      const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
      
      // 如果是認證路由且已登入，返回 false 讓 NextAuth 重定向
      if (isAuthRoute && auth?.user) {
        return false; // NextAuth 會自動重定向到 callbackUrl 或首頁
      }
      
      // 如果不是公開路由且未登入，返回 false
      if (!isPublicRoute && !auth?.user) {
        return false; // NextAuth 會自動重定向到登入頁
      }
      
      return true; // 允許訪問
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // OAuth 登入時更新用戶資訊
      if (account?.provider && account.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          token.email = dbUser.email;
          token.name = dbUser.name ?? undefined;
          token.picture = dbUser.image ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // OAuth 新用戶自動驗證 Email
      if (isNewUser && account?.provider !== 'credentials') {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
