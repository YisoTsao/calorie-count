-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('STREAK_7', 'STREAK_30', 'STREAK_100', 'WEIGHT_GOAL', 'CALORIE_GOAL_WEEK', 'CALORIE_GOAL_MONTH', 'WATER_CHAMPION', 'EXERCISE_WARRIOR', 'FIRST_MEAL', 'FIRST_WEEK');

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mealCount" INTEGER NOT NULL DEFAULT 0,
    "totalWater" INTEGER NOT NULL DEFAULT 0,
    "waterCount" INTEGER NOT NULL DEFAULT 0,
    "totalExercise" INTEGER NOT NULL DEFAULT 0,
    "totalExerciseCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exerciseCount" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "calorieGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "proteinGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "waterGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "exerciseGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "allGoalsMet" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_userId_idx" ON "achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_type_key" ON "achievements"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- CreateIndex
CREATE INDEX "daily_stats_userId_date_idx" ON "daily_stats"("userId", "date");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
