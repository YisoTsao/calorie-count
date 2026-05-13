## Why

廚房功能缺少食材直接編輯入口、推薦料理無法收藏與排程，使用者被迫每次重新掃描或重新詢問 AI；後台也無法手動調整用戶訂閱，導致客服無法彈性處理。這四個缺口都是使用留存的直接阻礙，需要一起補齊。

## What Changes

- **食材行內編輯**：食材清單的每個 badge 可直接點擊編輯名稱與數量，確認後即時 PATCH `/api/ai/kitchen/inventory`
- **個人菜單收藏**：今日推薦的每道料理可加入「我的菜單」，持久化保存至新的 `saved_recipes` 資料表
- **預計煮菜日曆**：收藏料理時可指定烹煮日，以月曆視圖（react-big-calendar）呈現；日曆事件可刪除
- **後台訂閱管理**：在 admin 後台新增 Subscription 頁面，可查看所有用戶訂閱狀態（plan / status / 到期日），並可手動升降等級

## Capabilities

### New Capabilities
- `ingredient-inline-edit`：食材清單行內編輯名稱與數量，即時同步庫存
- `saved-recipes`：收藏推薦料理至個人菜單，支援查看與刪除
- `cooking-schedule`：為收藏料理指定預計烹煮日，月曆視圖顯示排程
- `admin-subscription-management`：後台手動管理用戶訂閱等級與查看訂閱明細

### Modified Capabilities
- `database-schema`：新增 `saved_recipes`、`cooking_schedule_events` 兩張資料表；`UserSubscription` 無欄位變更（直接使用現有 plan/status/dates）

## Impact

- **新 Prisma models**：`SavedRecipe`、`CookingScheduleEvent`
- **新 API routes**：`/api/recipes/saved`（GET/POST/DELETE）、`/api/cooking-schedule`（GET/POST/DELETE）、`/api/admin/subscriptions`（GET/PATCH）
- **新 UI 元件**：`IngredientEditBadge`、`SaveRecipeButton`、`CookingCalendar`、`AdminSubscriptionTable`
- **新套件**：`react-big-calendar` + `date-fns`（Peer dep）
- **後台 RBAC**：新頁面需 ADMIN 角色，走現有 `(admin)` layout
