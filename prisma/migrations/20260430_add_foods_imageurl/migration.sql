-- AlterTable: add imageUrl column to foods (was missing from dev Supabase)
ALTER TABLE "foods" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
