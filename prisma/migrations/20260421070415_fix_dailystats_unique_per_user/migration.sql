/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `daily_stats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "daily_stats_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_userId_date_key" ON "daily_stats"("userId", "date");
