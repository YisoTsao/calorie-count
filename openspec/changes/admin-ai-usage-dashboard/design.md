## Context

後台 `(admin)` 目錄已有成員管理、食物資料庫、AI 掃描記錄等頁面。`ai_usage_logs` 資料表已存在並由 `lib/ai/usage-logger.ts` 寫入，每次食物辨識都會記錄 model、tokens、cost。

現有問題：無任何前端報表，開發者無法掌握用量趨勢與成本。

## Goals / Non-Goals

**Goals:**
- 後台 `/admin/ai-usage` 頁面可視化 AI 用量
- Server Component 直接從 DB 查詢，無需額外 client-side fetching
- API Route 支援聚合查詢（日期範圍、分組維度）

**Non-Goals:**
- 不實作 "source" 欄位（Web/iOS/Android），資料庫未收集此資訊
- 不實作即時 WebSocket 更新，靜態 SSR 即可滿足需求
- 不整合第三方圖表套件（使用 Tailwind CSS 長條圖，保持 bundle 輕量）

## Decisions

### Server Component 直接查 DB vs API Route

選擇：**Server Component 直接用 Prisma 查詢**

理由：頁面為管理後台，不需要 client-side 互動式 re-fetch（切日期範圍用 URL searchParams → RSC re-render）。避免多一層 API Route 的無謂複雜度。

但摘要統計 API Route 仍提供，供未來前端日期篩選器的互動式更新使用。

### 圖表實作

選擇：**純 Tailwind CSS 長條圖 + 數字統計卡**

理由：
- 避免引入 recharts / chart.js 等套件，bundle size 保持精簡
- 管理後台用量的主要需求是「看數字」，不需要精確的互動式折線圖
- 後續若有進階需求可換成 recharts（design 已預留介面）

## Risks / Trade-offs

- [資料量] ai_usage_logs 成長後大量查詢可能慢 → 已有 `(userId)`, `(userId, createdAt)`, `(feature)` 索引，全域查詢需加 `(createdAt)` 索引
- [成本計算] estimatedCostUsd 是近似值（以記錄時的定價計算），非 OpenAI 帳單精確數字 → UI 標注「估算值」即可
