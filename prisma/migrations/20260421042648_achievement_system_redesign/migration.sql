/*
  Warnings:

  - You are about to drop the `achievements` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('FIRST_MEAL', 'STREAK_DAYS', 'TOTAL_MEALS', 'TOTAL_DAYS', 'GOAL_HIT_COUNT');

-- DropForeignKey
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_userId_fkey";

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "achievements";

-- DropEnum
DROP TYPE "AchievementType";

-- CreateTable
CREATE TABLE "achievement_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerValue" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressSnapshot" JSONB,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_definitions_code_key" ON "achievement_definitions"("code");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_definitionId_key" ON "user_achievements"("userId", "definitionId");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "achievement_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
