## 1. 資料庫 Schema 擴充

- [x] 1.1 在 `prisma/schema.prisma` 新增 `SavedRecipe` model（id, userId, name, data Json, createdAt）
- [x] 1.2 在 `prisma/schema.prisma` 新增 `CookingScheduleEvent` model（id, userId, savedRecipeId?, recipeName, scheduledDate, note?, createdAt）
- [x] 1.3 在 `User` model 新增 `savedRecipes SavedRecipe[]` 與 `cookingScheduleEvents CookingScheduleEvent[]` 關聯
- [x] 1.4 執行 `bun db:migrate`，確認 migration 生成並套用成功

## 2. 食材行內編輯

- [x] 2.1 確認 `PATCH /api/ai/kitchen/inventory` 支援單筆 ingredient update（body: `{ ingredientId, name, quantity }`）；若不支援則补上
- [x] 2.2 在 `components/kitchen/IngredientList.tsx` 新增 `onUpdate?: (id: string, name: string, quantity: string) => void` prop
- [x] 2.3 在 `IngredientList` 的每個 badge 加入 click-to-edit 行內模式（name input + quantity input），Enter/blur 儲存，Escape 取消
- [x] 2.4 在 `components/kitchen/KitchenScanPanel.tsx` 實作 `handleUpdate` 函式，呼叫 PATCH API 並更新本地 ingredients state
- [x] 2.5 驗證：點擊 badge → 出現 input → 修改 → Enter → badge 更新顯示新値

## 3. 個人菜單收藏 API

- [x] 3.1 新增 `app/api/recipes/saved/route.ts`（GET：取得用戶所有收藏；POST：新增收藏，同名時回 409）
- [x] 3.2 新增 `app/api/recipes/saved/[id]/route.ts`（DELETE：刪除指定收藏）
- [x] 3.3 在 POST handler 定義 Zod schema 驗證 body（name: string, data: SavedRecipeData）

## 4. 個人菜單收藏 UI

- [x] 4.1 在 `components/kitchen/RecipeCard.tsx` 新增 `onSave?`、`isSaved?`、`onDelete?`、`onSchedule?` prop
- [x] 4.2 在 RecipeCard 標題列加入 BookmarkPlus / BookmarkCheck 按鈕（`isSaved` 為 true 時 disabled）
- [x] 4.3 新增頁面 `app/[locale]/(dashboard)/my-recipes/page.tsx`，以 SWR 呼叫 GET `/api/recipes/saved`，列出 RecipeCard 清單
- [x] 4.4 在個人菜單頁每張 RecipeCard 加入刪除按鈕（Trash2），點擊後呼叫 DELETE API + mutate SWR
- [x] 4.5 加入空狀態 UI（無收藏時顯示引導訊息）
- [x] 4.6 在 `RecipeRecommendPanel` 傳入 `onSave`、`isSaved`、`onSchedule` 給每張 RecipeCard

## 5. 烹煮排程 API

- [x] 5.1 新增 `app/api/cooking-schedule/route.ts`（GET：取得當月排程；POST：新增排程）
- [x] 5.2 新增 `app/api/cooking-schedule/[id]/route.ts`（DELETE：刪除指定排程）
- [x] 5.3 GET handler 支援 `?month=YYYY-MM` query param，按月份過濾

## 6. 烹煮排程 UI（月曆）

- [x] 6.1 安裝套件：`bun add react-big-calendar date-fns`，`bun add -d @types/react-big-calendar`
- [x] 6.2 新增 `components/kitchen/CookingCalendar.tsx`，以 `dynamic({ ssr: false })` 包裝 react-big-calendar（避免 SSR 問題）
- [x] 6.3 在 RecipeCard（推薦頁與個人菜單頁）加入 CalendarPlus 按鈕，點擊後開啟日期選擇 Popover
- [x] 6.4 Popover 確認後呼叫 POST `/api/cooking-schedule`，成功顯示 toast
- [x] 6.5 新增頁面 `app/[locale]/(dashboard)/cooking-calendar/page.tsx`，載入 CookingCalendar 元件，以 SWR 依月份取得事件
- [x] 6.6 月曆事件 click → Popover 顯示料理詳情（名稱、熱量、烹飪時間）+ 刪除按鈕
- [x] 6.7 加入月份切換時重新 fetch（SWR key 包含 `?month=YYYY-MM`）

## 7. 後台訂閱管理 API

- [x] 7.1 新增 `app/api/admin/subscriptions/route.ts`（GET：取得所有用戶訂閱資料，需 ADMIN 角色）
- [x] 7.2 新增 `app/api/admin/subscriptions/[userId]/route.ts`（PATCH：更新 plan/status/currentPeriodEnd，需 ADMIN 角色）
- [x] 7.3 GET handler 回傳：`{ userId, name, email, plan, status, currentPeriodStart, currentPeriodEnd, updatedAt }`
- [x] 7.4 PATCH handler 使用 Zod 驗證 body，僅允許 `plan`、`status`、`currentPeriodEnd` 欄位

## 8. 後台訂閱管理 UI

- [x] 8.1 新增頁面 `app/(admin)/admin/subscriptions/page.tsx`（走現有 admin layout，含 RBAC 守門）
- [x] 8.2 以 SWR 呼叫 GET `/api/admin/subscriptions`，以 shadcn Table 顯示用戶列表
- [x] 8.3 加入 email / name client-side 搜尋過濾
- [x] 8.4 加入 plan / status 顏色 Badge（FREE=gray, PREMIUM=blue, PRO=gold；ACTIVE=green, EXPIRED=red, CANCELLED=red）
- [x] 8.5 新增編輯 Dialog（`components/admin/SubscriptionEditDialog.tsx`），內含 plan Select、status Select、currentPeriodEnd DatePicker
- [x] 8.6 Dialog 「儲存」先顯示二次確認 AlertDialog，確認後呼叫 PATCH API + mutate SWR
- [x] 8.7 到期日顯示格式：`yyyy-MM-dd`，已過期標紅

## 9. i18n 翻譯

- [x] 9.1 在 `messages/zh-TW.json` 新增 `myRecipes`、`cookingCalendar`、`adminSubscriptions` namespace 的翻譯鍵値
- [x] 9.2 同步更新 `messages/en.json` 與 `messages/ja.json`

## 10. 驗收確認

- [x] 10.1 食材行內編輯：點擊 badge → 修改 → 儲存 → 顯示新値，Escape 可取消
- [x] 10.2 收藏料理：今日推薦 → 收藏 → 個人菜單頁可見 → 刪除後消失
- [x] 10.3 烹煮排程：個人菜單 → 加入排程 → 月曆頁可見事件 → 刪除後消失
- [x] 10.4 後台訂閱管理：Admin 登入 → `/admin/subscriptions` → 可查看、搜尋、修改用戶方案
- [x] 10.5 非 ADMIN 存取後台頁面時被拒
