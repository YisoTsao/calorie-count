-- 新增 saved_recipes 資料表
CREATE TABLE "saved_recipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_recipes_pkey" PRIMARY KEY ("id")
);

-- 新增 cooking_schedule_events 資料表
CREATE TABLE "cooking_schedule_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savedRecipeId" TEXT,
    "recipeName" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cooking_schedule_events_pkey" PRIMARY KEY ("id")
);

-- 建立索引
CREATE INDEX "saved_recipes_userId_idx" ON "saved_recipes"("userId");
CREATE INDEX "cooking_schedule_events_userId_idx" ON "cooking_schedule_events"("userId");
CREATE INDEX "cooking_schedule_events_scheduledDate_idx" ON "cooking_schedule_events"("scheduledDate");

-- 建立外鍵
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cooking_schedule_events" ADD CONSTRAINT "cooking_schedule_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
