## ADDED Requirements

### Requirement: 為料理安排預計烹煮日
系統 SHALL 允許使用者為收藏的料理或今日推薦的料理指定一個預計烹煮日期，排程資訊儲存至 `cooking_schedule_events` 表，並在月曆視圖中呈現。

#### Scenario: 從 RecipeCard 新增排程
- **WHEN** 使用者在 RecipeCard（推薦頁或個人菜單頁）點擊「加入烹煮計畫」按鈕（CalendarPlus icon）
- **THEN** 系統 SHALL 彈出日期選擇器 Popover，讓使用者選擇日期

#### Scenario: 確認日期後儲存排程
- **WHEN** 使用者在 Popover 中選取日期並點擊「確認」
- **THEN** 系統 SHALL 發送 POST `/api/cooking-schedule`，body 為 `{ recipeName, scheduledDate, savedRecipeId? }`，儲存成功後顯示成功 toast

#### Scenario: 查看月曆排程
- **WHEN** 使用者前往 `/cooking-calendar` 頁面
- **THEN** 系統 SHALL 透過 GET `/api/cooking-schedule` 取得該月所有排程，以 react-big-calendar 月視圖顯示，每筆事件顯示料理名稱

#### Scenario: 月曆點擊事件查看詳情
- **WHEN** 使用者在月曆上點擊一個事件
- **THEN** 系統 SHALL 顯示料理詳情 Popover，包含料理名稱、熱量、烹飪時間，以及刪除排程按鈕

#### Scenario: 刪除排程事件
- **WHEN** 使用者在事件 Popover 中點擊刪除並確認
- **THEN** 系統 SHALL 發送 DELETE `/api/cooking-schedule/:id`，月曆即時移除該事件

#### Scenario: 月曆無事件時的空狀態
- **WHEN** 當月沒有任何排程事件
- **THEN** 系統 SHALL 顯示引導提示，說明如何從推薦頁或個人菜單加入排程
