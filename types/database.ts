/**
 * 資料庫相關型別擴展
 */

import type { Prisma } from '@prisma/client';

// User with all relations
export type UserWithAll = Prisma.UserGetPayload<{
  include: {
    profile: true;
    goals: true;
    preferences: true;
    accounts: true;
    sessions: true;
  };
}>;

// User with profile only
export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: true;
  };
}>;

// User with goals only
export type UserWithGoals = Prisma.UserGetPayload<{
  include: {
    goals: true;
  };
}>;

// User with preferences only
export type UserWithPreferences = Prisma.UserGetPayload<{
  include: {
    preferences: true;
  };
}>;

// Prisma transaction client type
export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Common select fields
export const userBasicSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const publicUserSelect = {
  id: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;
