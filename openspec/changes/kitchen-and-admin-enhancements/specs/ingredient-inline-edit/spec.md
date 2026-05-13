## ADDED Requirements

### Requirement: 食材 badge 可行內編輯
系統 SHALL 允許使用者在食材清單中直接點擊任一食材 badge，進入行內編輯模式修改名稱與數量，儲存後即時更新庫存。

#### Scenario: 點擊食材 badge 進入編輯模式
- **WHEN** 使用者點擊食材清單中的任一食材 badge
- **THEN** badge 切換為行內 input 欄位（名稱 + 數量），並自動 focus 到名稱欄位

#### Scenario: 按 Enter 或 blur 儲存變更
- **WHEN** 使用者修改名稱或數量後按下 Enter 鍵或 blur input 欄位
- **THEN** 系統 SHALL 發送 PATCH `/api/ai/kitchen/inventory` 請求，body 包含 `{ ingredientId, name, quantity }`，並在成功後更新畫面

#### Scenario: 按 Escape 取消編輯
- **WHEN** 使用者在行內編輯模式下按下 Escape 鍵
- **THEN** 系統 SHALL 放棄所有變更，badge 還原為顯示模式，不發送任何請求

#### Scenario: 儲存空值時的驗證
- **WHEN** 使用者清空名稱欄位後嘗試儲存
- **THEN** 系統 SHALL 不送出請求，並在 input 邊框顯示紅色提示錯誤

#### Scenario: PATCH 失敗時的處理
- **WHEN** PATCH 請求回傳非 2xx 狀態
- **THEN** 系統 SHALL 還原 badge 為原始值並顯示 toast 錯誤訊息
