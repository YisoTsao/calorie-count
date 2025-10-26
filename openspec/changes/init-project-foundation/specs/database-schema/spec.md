## ADDED Requirements

### Requirement: 資料庫 Schema 定義
系統 MUST 使用 Prisma ORM 定義所有資料庫表格與關聯。

#### Scenario: User 表格
- **WHEN** 建立資料庫 schema
- **THEN** User 表格 MUST 包含以下欄位:
  - id (String, UUID, 主鍵)
  - email (String, 唯一, 必填)
  - emailVerified (DateTime, 可選)
  - name (String, 可選)
  - image (String, 可選)
  - password (String, 可選, 加密儲存)
  - createdAt (DateTime, 自動)
  - updatedAt (DateTime, 自動)
- **AND** 與 Account, Session, UserProfile 有一對多關聯

#### Scenario: Account 表格 (OAuth 帳號)
- **WHEN** 使用者透過 OAuth 登入
- **THEN** Account 表格 MUST 包含:
  - id (String, UUID, 主鍵)
  - userId (String, 外鍵連接 User)
  - type (String, 例如: oauth)
  - provider (String, 例如: google, apple)
  - providerAccountId (String)
  - refresh_token (String, 可選)
  - access_token (String, 可選)
  - expires_at (Int, 可選)
  - token_type (String, 可選)
  - scope (String, 可選)
  - id_token (String, 可選)
  - session_state (String, 可選)
- **AND** userId + provider + providerAccountId 組成唯一索引

#### Scenario: Session 表格
- **WHEN** 使用者登入
- **THEN** Session 表格 MUST 包含:
  - id (String, UUID, 主鍵)
  - sessionToken (String, 唯一)
  - userId (String, 外鍵連接 User)
  - expires (DateTime)
- **AND** 過期的 sessions 應定期清理

#### Scenario: VerificationToken 表格
- **WHEN** 發送 email 驗證或密碼重置連結
- **THEN** VerificationToken 表格 MUST 包含:
  - identifier (String, email)
  - token (String, 唯一)
  - expires (DateTime)
- **AND** identifier + token 組成唯一索引

#### Scenario: UserProfile 表格
- **WHEN** 儲存使用者個人資料
- **THEN** UserProfile 表格 MUST 包含:
  - id (String, UUID, 主鍵)
  - userId (String, 外鍵連接 User, 唯一)
  - dateOfBirth (DateTime, 可選)
  - gender (Enum: MALE, FEMALE, OTHER, 可選)
  - height (Float, 公分, 可選)
  - weight (Float, 公斤, 可選)
  - targetWeight (Float, 可選)
  - activityLevel (Enum: SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE)
  - createdAt (DateTime, 自動)
  - updatedAt (DateTime, 自動)

#### Scenario: UserGoals 表格
- **WHEN** 設定每日目標
- **THEN** UserGoals 表格 MUST 包含:
  - id (String, UUID, 主鍵)
  - userId (String, 外鍵連接 User, 唯一)
  - goalType (Enum: LOSE_WEIGHT, GAIN_WEIGHT, MAINTAIN)
  - dailyCalorieGoal (Int)
  - proteinGoal (Float, 克)
  - carbsGoal (Float, 克)
  - fatGoal (Float, 克)
  - waterGoal (Int, 毫升, 預設 2000)
  - targetDate (DateTime, 可選)
  - createdAt (DateTime, 自動)
  - updatedAt (DateTime, 自動)

#### Scenario: UserPreferences 表格
- **WHEN** 儲存使用者偏好設定
- **THEN** UserPreferences 表格 MUST 包含:
  - id (String, UUID, 主鍵)
  - userId (String, 外鍵連接 User, 唯一)
  - theme (Enum: LIGHT, DARK, AUTO, 預設 LIGHT)
  - language (String, 預設 zh-TW)
  - units (Enum: METRIC, IMPERIAL, 預設 METRIC)
  - notificationMealReminders (Boolean, 預設 true)
  - notificationWaterReminders (Boolean, 預設 true)
  - notificationGoalReminders (Boolean, 預設 true)
  - notificationSocialUpdates (Boolean, 預設 true)
  - privacyProfileVisibility (Enum: PUBLIC, FRIENDS, PRIVATE, 預設 FRIENDS)
  - privacyShowWeight (Boolean, 預設 false)
  - privacyShowProgress (Boolean, 預設 true)
  - createdAt (DateTime, 自動)
  - updatedAt (DateTime, 自動)

### Requirement: 資料庫索引優化
系統 MUST 在常用查詢欄位建立索引以提升效能。

#### Scenario: 建立必要索引
- **WHEN** 設計資料庫 schema
- **THEN** MUST 在以下欄位建立索引:
  - User.email (唯一索引)
  - Session.sessionToken (唯一索引)
  - Session.userId (一般索引)
  - Account.userId (一般索引)
  - Account.provider + Account.providerAccountId (複合唯一索引)

### Requirement: 資料完整性約束
系統 MUST 使用資料庫約束確保資料完整性。

#### Scenario: 外鍵約束
- **WHEN** 刪除 User
- **THEN** 相關的 Account, Session, UserProfile, UserGoals, UserPreferences MUST 級聯刪除 (onDelete: Cascade)

#### Scenario: 必填欄位驗證
- **WHEN** 插入或更新資料
- **THEN** 資料庫 MUST 檢查必填欄位不為空
- **AND** email MUST 符合格式
- **AND** 唯一欄位不重複

### Requirement: 資料庫遷移管理
系統 MUST 使用 Prisma Migrate 管理資料庫結構變更。

#### Scenario: 執行資料庫遷移
- **WHEN** schema.prisma 有變更
- **THEN** 開發者 MUST 執行 `prisma migrate dev --name <描述>`
- **AND** 生產環境 MUST 執行 `prisma migrate deploy`
- **AND** 所有遷移檔案 MUST 版本控制

#### Scenario: 產生 Prisma Client
- **WHEN** schema 變更後
- **THEN** MUST 執行 `prisma generate` 更新 TypeScript 型別
- **AND** 應用程式重啟後載入新的 Prisma Client
