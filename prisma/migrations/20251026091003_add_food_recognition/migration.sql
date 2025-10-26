-- CreateEnum
CREATE TYPE "RecognitionStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED', 'EDITED');

-- CreateTable
CREATE TABLE "food_recognitions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" "RecognitionStatus" NOT NULL DEFAULT 'PROCESSING',
    "rawResult" JSONB,
    "confidence" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "recognitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "portion" TEXT NOT NULL,
    "portionSize" DOUBLE PRECISION NOT NULL,
    "portionUnit" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_recognitions_userId_idx" ON "food_recognitions"("userId");

-- CreateIndex
CREATE INDEX "food_recognitions_status_idx" ON "food_recognitions"("status");

-- CreateIndex
CREATE INDEX "food_items_recognitionId_idx" ON "food_items"("recognitionId");

-- AddForeignKey
ALTER TABLE "food_recognitions" ADD CONSTRAINT "food_recognitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "food_recognitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
