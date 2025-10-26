## ADDED Requirements

### Requirement: Email 註冊
系統 MUST 允許使用者使用 Email 和密碼註冊新帳號。

#### Scenario: 有效的註冊資料
- **WHEN** 使用者提供有效的 email、密碼(最少8字元)、姓名
- **THEN** 系統建立新使用者帳號
- **AND** 發送驗證郵件到該 email
- **AND** 回傳成功訊息與使用者 ID

#### Scenario: Email 已被註冊
- **WHEN** 使用者提供已存在的 email
- **THEN** 系統回傳錯誤訊息 "此 Email 已被註冊"
- **AND** 不建立新帳號

#### Scenario: 密碼強度不足
- **WHEN** 使用者提供少於8字元的密碼
- **THEN** 系統回傳錯誤訊息 "密碼至少需要8個字元"
- **AND** 不建立新帳號

### Requirement: Email 驗證
系統 MUST 要求使用者驗證 email 才能使用完整功能。

#### Scenario: 點擊驗證連結
- **WHEN** 使用者點擊郵件中的驗證連結
- **AND** token 有效且未過期(24小時內)
- **THEN** 系統標記該帳號為已驗證
- **AND** 允許使用者登入使用所有功能

#### Scenario: 驗證 token 過期
- **WHEN** 使用者點擊過期的驗證連結
- **THEN** 系統顯示錯誤訊息 "驗證連結已過期"
- **AND** 提供重新發送驗證郵件的選項

### Requirement: Email 密碼登入
系統 MUST 允許已驗證的使用者使用 email 和密碼登入。

#### Scenario: 正確的登入憑證
- **WHEN** 使用者提供正確的 email 和密碼
- **AND** 帳號已驗證
- **THEN** 系統建立新的 session
- **AND** 回傳 JWT access token 和 refresh token
- **AND** 重定向到儀表板

#### Scenario: 錯誤的密碼
- **WHEN** 使用者提供錯誤的密碼
- **THEN** 系統回傳錯誤訊息 "Email 或密碼錯誤"
- **AND** 不建立 session

#### Scenario: 帳號未驗證
- **WHEN** 使用者嘗試登入未驗證的帳號
- **THEN** 系統回傳錯誤訊息 "請先驗證您的 Email"
- **AND** 提供重新發送驗證郵件的選項

### Requirement: Google OAuth 登入
系統 MUST 支援使用 Google 帳號登入。

#### Scenario: 首次使用 Google 登入
- **WHEN** 使用者選擇 Google 登入
- **AND** 授權成功
- **AND** 該 Google 帳號尚未關聯任何使用者
- **THEN** 系統自動建立新使用者帳號
- **AND** 關聯該 Google 帳號
- **AND** 標記為已驗證(不需 email 驗證)
- **AND** 建立 session 並登入

#### Scenario: 已關聯的 Google 帳號登入
- **WHEN** 使用者使用已關聯的 Google 帳號登入
- **THEN** 系統建立 session 並登入
- **AND** 重定向到儀表板

### Requirement: Apple OAuth 登入
系統 SHOULD 支援使用 Apple 帳號登入(可選功能)。

#### Scenario: 使用 Apple 登入
- **WHEN** 使用者選擇 Apple 登入
- **AND** 授權成功
- **THEN** 系統處理流程與 Google OAuth 相同

### Requirement: 登出
系統 MUST 允許使用者登出並終止 session。

#### Scenario: 使用者登出
- **WHEN** 使用者點擊登出按鈕
- **THEN** 系統刪除該使用者的 session
- **AND** 清除前端儲存的 tokens
- **AND** 重定向到登入頁面

### Requirement: 忘記密碼
系統 MUST 提供密碼重置功能。

#### Scenario: 請求重置密碼
- **WHEN** 使用者提供已註冊的 email
- **THEN** 系統發送密碼重置連結到該 email
- **AND** 顯示訊息 "已發送重置連結到您的信箱"

#### Scenario: 使用重置連結
- **WHEN** 使用者點擊有效的重置連結
- **AND** 提供新密碼(至少8字元)
- **THEN** 系統更新密碼
- **AND** 終止所有現有 sessions
- **AND** 顯示成功訊息

### Requirement: Session 管理
系統 MUST 管理使用者 sessions 並自動刷新 tokens。

#### Scenario: Access token 過期
- **WHEN** access token 過期(30分鐘後)
- **AND** refresh token 仍然有效(7天內)
- **THEN** 系統自動使用 refresh token 取得新的 access token
- **AND** 更新前端儲存的 token

#### Scenario: Refresh token 過期
- **WHEN** refresh token 也過期
- **THEN** 系統要求使用者重新登入
- **AND** 重定向到登入頁面

### Requirement: 受保護路由
系統 MUST 保護需要認證的頁面和 API。

#### Scenario: 未登入訪問受保護頁面
- **WHEN** 未登入的使用者訪問儀表板或其他受保護頁面
- **THEN** 系統重定向到登入頁面
- **AND** 記錄原本要訪問的 URL(登入後返回)

#### Scenario: 未登入調用受保護 API
- **WHEN** 未登入的使用者調用需要認證的 API
- **THEN** 系統回傳 401 Unauthorized
- **AND** 回傳錯誤訊息 "請先登入"
