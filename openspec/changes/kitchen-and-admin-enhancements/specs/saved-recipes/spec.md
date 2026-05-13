## ADDED Requirements

### Requirement: 收藏推薦料理至個人菜單
系統 SHALL 允許使用者在「今日推薦」頁面點擊收藏按鈕，將料理儲存至個人菜單（saved_recipes），並可在個人菜單頁查看與刪除。

#### Scenario: 收藏一道料理
- **WHEN** 使用者在 RecipeCard 上點擊「收藏」按鈕（BookmarkPlus icon）
- **THEN** 系統 SHALL 發送 POST `/api/recipes/saved`，body 為完整 Recipe JSON，儲存後按鈕狀態切換為「已收藏」（BookmarkCheck，disabled）

#### Scenario: 不重複收藏
- **WHEN** 使用者嘗試收藏一道名稱相同且已在個人菜單中的料理
- **THEN** 系統 SHALL 回傳 409 Conflict，前端顯示「已在菜單中」toast，不新增重複記錄

#### Scenario: 查看個人菜單
- **WHEN** 使用者前往 `/my-recipes` 頁面
- **THEN** 系統 SHALL 透過 GET `/api/recipes/saved` 取得所有收藏清單，以 RecipeCard 形式顯示

#### Scenario: 刪除收藏料理
- **WHEN** 使用者在個人菜單頁點擊刪除（Trash2 icon）並確認
- **THEN** 系統 SHALL 發送 DELETE `/api/recipes/saved/:id`，從清單移除該料理並顯示成功 toast

#### Scenario: 個人菜單為空時的空狀態
- **WHEN** 使用者前往 `/my-recipes` 頁面且尚無收藏
- **THEN** 系統 SHALL 顯示空狀態提示，引導使用者前往廚房頁面掃描並取得推薦
