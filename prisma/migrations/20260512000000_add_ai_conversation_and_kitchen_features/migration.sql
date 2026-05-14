-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "IngredientAddedVia" AS ENUM ('SCAN', 'CHAT', 'MANUAL');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIALING');

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "id"               TEXT NOT NULL,
    "userId"           TEXT NOT NULL,
    "status"           "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "messages"         JSONB NOT NULL,
    "pendingFoods"     JSONB NOT NULL,
    "suggestedMealType" "MealType" NOT NULL DEFAULT 'LUNCH',
    "mealDate"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt"        TIMESTAMP(3) NOT NULL,
    "confirmedMealId"  TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_inventories" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "scanImages"    TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastScannedAt" TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_ingredients" (
    "id"           TEXT NOT NULL,
    "inventoryId"  TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "category"     TEXT NOT NULL,
    "quantity"     TEXT NOT NULL,
    "isAvailable"  BOOLEAN NOT NULL DEFAULT true,
    "aiConfidence" DOUBLE PRECISION,
    "addedVia"     "IngredientAddedVia" NOT NULL DEFAULT 'SCAN',
    "scanImageUrl" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id"                   TEXT NOT NULL,
    "userId"               TEXT NOT NULL,
    "plan"                 "SubscriptionPlan"   NOT NULL DEFAULT 'FREE',
    "status"               "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd"     TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd"    BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId"     TEXT,
    "stripeSubscriptionId" TEXT,
    "paymentProvider"      TEXT,
    "paymentMetadata"      JSONB,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_sessions_userId_idx" ON "conversation_sessions"("userId");

-- CreateIndex
CREATE INDEX "conversation_sessions_userId_status_idx" ON "conversation_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "conversation_sessions_expiresAt_idx" ON "conversation_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_inventories_userId_key" ON "kitchen_inventories"("userId");

-- CreateIndex
CREATE INDEX "kitchen_ingredients_inventoryId_idx" ON "kitchen_ingredients"("inventoryId");

-- CreateIndex
CREATE INDEX "kitchen_ingredients_inventoryId_isAvailable_idx" ON "kitchen_ingredients"("inventoryId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_key" ON "user_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "user_subscriptions_userId_idx" ON "user_subscriptions"("userId");

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_inventories" ADD CONSTRAINT "kitchen_inventories_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_ingredients" ADD CONSTRAINT "kitchen_ingredients_inventoryId_fkey"
    FOREIGN KEY ("inventoryId") REFERENCES "kitchen_inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
