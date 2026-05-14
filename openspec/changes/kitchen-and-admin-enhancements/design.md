## Context

本次變更在現有「廚房食材管理（Kitchen）」功能之上新增四項延伸能力：
1. **食材行內編輯**：`IngredientList` 目前只能刪除，不能編輯名稱或數量
2. **個人菜單收藏**：`RecipeCard` 只有展開步驟按鈕，無法儲存料理
3. **預計煮菜日曆**：無日曆功能，無法規劃烹煮計畫
4. **後台訂閱管理**：`UserSubscription` schema 已就緒但後台無管理頁面

現有技術限制：
- `IngredientList` 已有分類分組渲染邏輯，需在 badge 內加入 edit 模式
- `RecipeCard` 為純展示元件，`RecipeCardProps` 無 `recipeId`（AI 回應沒有 DB id）
- `UserSubscription` 已有 `plan / status / currentPeriodStart / currentPeriodEnd`，後台只需 PATCH 操作

---

## Goals / Non-Goals

**Goals:**
- 食材 badge 可 click → inline 編輯 name + quantity → PATCH `/api/ai/kitchen/inventory`
- 推薦料理可收藏（SavedRecipe），個人菜單頁顯示收藏清單
- 收藏料理時可挑選日期，月曆視圖顯示排程（CookingScheduleEvent）
- Admin 後台新增 Subscription 頁：搜尋用戶、查看訂閱、手動改 plan/status
- 所有新 API 遵循 `createSuccessResponse / createErrorResponse` 規範

**Non-Goals:**
- 實際金流整合（Stripe 欄位預留，本次不串接）
- 料理步驟編輯、食材分類自訂
- 月曆事件提醒推播

---

## Decisions

### D1：食材行內編輯實作方式

**選擇：click-to-edit badge（無 modal）**

- 點擊 badge 後，name 和 quantity 各自變成 `<input>`，blur 或 Enter 送出
- PATCH body：`{ ingredientId, name?, quantity? }`
- 現有 `PATCH /api/ai/kitchen/inventory` route 已有更新邏輯，只需確認支援單筆 update

替代考量：開 Dialog 彈窗 → 過重，badge inline 更快捷

### D2：SavedRecipe 資料模型

```
model SavedRecipe {
  id        String   @id @default(cuid())
  userId    String
  name      String
  data      Json     // 完整 Recipe object（calories, steps, ingredients…）
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("saved_recipes")
}
```

`data` 以 JSON 儲存整個 `Recipe` 物件，避免正規化 N 張表；料理內容相對靜態，JSON 讀取成本可忽略。

### D3：CookingScheduleEvent 資料模型

```
model CookingScheduleEvent {
  id            String   @id @default(cuid())
  userId        String
  savedRecipeId String?  // 可選關聯（從收藏新增時填入）
  recipeName    String
  scheduledDate DateTime // 只取 date 部分，時區統一 UTC 00:00
  note          String?
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([scheduledDate])
  @@map("cooking_schedule_events")
}
```

### D4：日曆套件選擇

**選擇：`react-big-calendar` + `date-fns`**

- 支援 month / week / day view，開箱即用
- MIT license，無需商業授權
- TypeScript 型別完整（`@types/react-big-calendar`）
- Bundle size ~80KB gzipped（可 lazy import）

替代：`@fullcalendar/react` → 功能更多但 bundle 更大；`react-calendar` → 太陽春缺少 event 顯示

### D5：Admin Subscription PATCH 權限

使用現有 `lib/rbac.ts` → `requireRole(session, ['ADMIN'])` 守門；
PATCH 允許修改：`plan`、`status`、`currentPeriodEnd`（可延期）。
不允許修改：`stripeCustomerId`、`paymentProvider`（避免污染金流資料）。

---

## Risks / Trade-offs

| 風險 | 緩解 |
|------|------|
| SavedRecipe.data JSON 與 Recipe 型別漂移 | 定義 `SavedRecipeData` Zod schema，存前驗證，取後 parse |
| react-big-calendar SSR 問題（window undefined） | 以 `dynamic(() => import(...), { ssr: false })` 動態載入 |
| 食材行內編輯頻繁 PATCH（每個字就送出） | blur + Enter 才送出，非 onChange |
| Admin 誤改訂閱方案無法還原 | 後台顯示 updatedAt，UI 加確認 Dialog |

---

## Migration Plan

1. 新增 Prisma models（`SavedRecipe`, `CookingScheduleEvent`）
2. 執行 `bun db:migrate`，生成並套用 migration
3. 部署 API routes（無 breaking change，全新端點）
4. 部署前端元件
5. Rollback：刪除 `saved_recipes` / `cooking_schedule_events` tables 即可，其他表無影響

---

## Open Questions

- `CookingScheduleEvent.scheduledDate` 是否需要存時間段（開始+結束），或只需日期？
  → 目前假設只存日期（午餐/晚餐不分），若未來需要可加 `mealTime` enum
- 個人菜單頁是否需要搜尋 / 分頁？
  → 初版不加，假設收藏數量 < 100，直接全撈
