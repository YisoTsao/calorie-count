## Why

管理後台目前沒有任何 OpenAI API 用量的可視化工具，開發者無法掌握 token 消耗速度、成本分佈及各功能用量。`ai_usage_logs` 資料已完整記錄於資料庫，只缺前端報表頁面。

## What Changes

- 新增後台頁面 `/admin/ai-usage`：OpenAI API 使用量儀表板
- 新增 API Route `GET /api/admin/ai-usage`：聚合查詢 `ai_usage_logs`，支援日期範圍、分組
- `AdminShell` 導覽列新增「AI 用量」入口（需 ADMIN 權限）

## Capabilities

### New Capabilities

- `admin-ai-usage-dashboard`：後台 OpenAI 用量儀表板
  - 總覽 KPI 卡：總請求數、總 tokens、總費用（USD）、平均每次費用
  - 用量趨勢折線圖（按天，顯示請求數與 token 量，可切換日期範圍：7天/30天/本月）
  - 模型用量分佈長條圖（按 model 分組，顯示請求數與費用佔比）
  - 功能用量分佈（按 feature 分組：food_recognition / nutrition_chat）
  - 最近 20 筆 API 請求記錄表（時間、用戶、模型、tokens、費用）

### Modified Capabilities

- `user-auth`：管理後台導覽需加入 AI 用量頁面入口，僅 ADMIN 角色可見

## Impact

- 新增：`app/(admin)/admin/ai-usage/page.tsx`
- 新增：`app/api/admin/ai-usage/route.ts`
- 修改：`components/admin/AdminShell.tsx`（navItems 加入 AI 用量）
- 依賴：現有 `AiUsageLog` Prisma model、`lib/rbac.ts` ADMIN 權限驗證
- 無 schema 異動、無新依賴套件（使用現有 chart library 或純 CSS 長條圖）
