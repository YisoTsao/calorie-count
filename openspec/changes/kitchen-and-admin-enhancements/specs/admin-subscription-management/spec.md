## ADDED Requirements

### Requirement: 後台查看所有用戶訂閱狀態
系統 SHALL 允許 ADMIN 角色在後台 `/admin/subscriptions` 頁面查看所有用戶的訂閱方案、狀態與到期日。

#### Scenario: 進入訂閱管理頁面
- **WHEN** ADMIN 使用者前往 `/admin/subscriptions`
- **THEN** 系統 SHALL 透過 GET `/api/admin/subscriptions` 取得所有用戶訂閱資料（含 user.name、user.email、plan、status、currentPeriodEnd），以表格顯示

#### Scenario: 非 ADMIN 存取被拒
- **WHEN** 非 ADMIN 角色用戶直接存取 `/admin/subscriptions`
- **THEN** 系統 SHALL 回傳 403 並重導至首頁

#### Scenario: 搜尋用戶
- **WHEN** ADMIN 在搜尋欄輸入 email 或名稱關鍵字
- **THEN** 系統 SHALL 以 client-side filter 過濾表格結果（無需重新請求 API）

### Requirement: 後台手動修改用戶訂閱等級
系統 SHALL 允許 ADMIN 在後台針對單一用戶覆寫訂閱方案（plan）、狀態（status）與到期日（currentPeriodEnd）。

#### Scenario: 點擊編輯開啟修改 Dialog
- **WHEN** ADMIN 在表格中點擊某用戶的「編輯」按鈕
- **THEN** 系統 SHALL 顯示 Dialog，預填目前的 plan / status / currentPeriodEnd，提供 Select 與 DatePicker 輸入

#### Scenario: 確認儲存修改
- **WHEN** ADMIN 修改方案後點擊「儲存」
- **THEN** 系統 SHALL 發送 PATCH `/api/admin/subscriptions/:userId`，body 為 `{ plan?, status?, currentPeriodEnd? }`，成功後表格即時更新並顯示成功 toast

#### Scenario: 修改前確認 Dialog
- **WHEN** ADMIN 在 Dialog 中點擊「儲存」
- **THEN** 系統 SHALL 先顯示確認訊息（「確定將 [email] 方案改為 [plan]？」），需要再次確認後才送出 PATCH 請求

#### Scenario: PATCH 失敗時的處理
- **WHEN** PATCH 請求回傳非 2xx 狀態
- **THEN** 系統 SHALL 顯示錯誤 toast，Dialog 維持開啟並保留輸入值

#### Scenario: 查看訂閱到期日
- **WHEN** ADMIN 查看訂閱表格
- **THEN** 系統 SHALL 以人類可讀格式（yyyy-MM-dd）顯示 currentPeriodStart 與 currentPeriodEnd，並以顏色標示到期狀態（綠色 = 有效，紅色 = 已到期/取消）
