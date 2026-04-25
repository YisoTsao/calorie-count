import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';
import { authConfig } from '@/lib/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // 覆蓋 CredentialsProvider，加入完整 DB 驗證邏輯
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

        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          throw new Error('Email 或密碼格式不正確');
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          throw new Error('Email 或密碼錯誤');
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Email 或密碼錯誤');
        }

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
    // Google Provider 繼承自 authConfig（spread 已包含）
    ...(authConfig.providers?.filter((p) => {
      const id = (p as { id?: string }).id;
      return id !== 'credentials';
    }) ?? []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      if (account?.provider && account.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { email: true, name: true, image: true },
        });
        if (dbUser) {
          token.email = dbUser.email ?? undefined;
          token.name = dbUser.name ?? undefined;
          token.picture = dbUser.image ?? undefined;
          // Log OAuth email for debugging
          console.info(
            `[auth:jwt] provider=${account.provider} email=${dbUser.email ?? '(none)'} userId=${token.id}`
          );
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
      // OAuth 新用戶自動標記 emailVerified（已通過 OAuth 信任）
      if (isNewUser && account?.provider !== 'credentials') {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }

      // Log OAuth 登入資訊，確認 email 有正確取得

      if (account && account.provider !== 'credentials') {
        const linkedAccounts = await prisma.account.count({
          where: { userId: user.id },
        });
        console.info(
          `[auth:signIn] provider=${account.provider} email=${user.email ?? '(none)'} userId=${user.id} isNewUser=${isNewUser} linkedProviders=${linkedAccounts}`
        );
      }
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
