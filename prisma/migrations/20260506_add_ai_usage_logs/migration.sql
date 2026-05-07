-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id"               TEXT NOT NULL,
    "userId"           TEXT NOT NULL,
    "feature"          VARCHAR(50) NOT NULL,
    "model"            VARCHAR(50) NOT NULL,
    "promptTokens"     INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens"      INTEGER NOT NULL,
    "estimatedCostUsd" DECIMAL(10,8) NOT NULL,
    "locale"           VARCHAR(10),
    "recognitionId"    TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_logs_userId_idx" ON "ai_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_userId_createdAt_idx" ON "ai_usage_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_logs_feature_idx" ON "ai_usage_logs"("feature");

-- AddForeignKey
ALTER TABLE "ai_usage_logs"
    ADD CONSTRAINT "ai_usage_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
