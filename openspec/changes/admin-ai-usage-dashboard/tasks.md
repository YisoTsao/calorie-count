## 1. API Route

- [x] 1.1 新增 `app/api/admin/ai-usage/route.ts`：GET，ADMIN 權限驗證，支援 `startDate`/`endDate`/`groupBy` query params
- [x] 1.2 實作 `groupBy=model` 聚合：回傳各 model 的 `{ model, count, totalTokens, totalCostUsd }`
- [x] 1.3 實作 `groupBy=feature` 聚合：回傳各 feature 的請求數
- [ ] 1.4 實作 `groupBy=day` 聚合：回傳每日請求數與 token 量（供趨勢圖使用）
- [x] 1.5 實作 KPI 摘要查詢：totalRequests, totalTokens, totalCostUsd, avgCostUsd

## 2. 後台頁面

- [x] 2.1 新增 `app/(admin)/admin/ai-usage/page.tsx`（Server Component），ADMIN 角色驗證
- [x] 2.2 實作四個 KPI 卡（總請求、總 tokens、總費用、平均費用），本月資料
- [x] 2.3 實作模型用量分佈表（model、請求數、tokens、費用、佔比）
- [x] 2.4 實作功能用量分佈（feature 分組，Tailwind 長條圖視覺化）
- [x] 2.5 實作最近 20 筆記錄表（時間、用戶 email、模型、tokens、費用）

## 3. AdminShell 導覽

- [x] 3.1 在 `components/admin/AdminShell.tsx` 的 `navItems` 加入 AI 用量項目，`minRole: 'ADMIN'`，路徑 `/admin/ai-usage`

## 4. DB 索引優化（選用）

- [x] 4.1 在 `prisma/schema.prisma` 的 `AiUsageLog` 加入 `@@index([createdAt])` 以加速全域日期範圍查詢
- [x] 4.2 執行 `bunx prisma db push` 套用索引變更
