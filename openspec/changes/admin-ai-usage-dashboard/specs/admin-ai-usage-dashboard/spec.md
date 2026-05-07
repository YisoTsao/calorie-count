## ADDED Requirements

### Requirement: AI 用量儀表板頁面
後台 `/admin/ai-usage` 頁面 SHALL 顯示 OpenAI API 的使用量統計，僅 ADMIN 角色可存取。

#### Scenario: ADMIN 存取儀表板
- **WHEN** ADMIN 角色使用者進入 `/admin/ai-usage`
- **THEN** 頁面顯示總覽 KPI 卡、模型分佈、功能分佈及最近記錄

#### Scenario: 非 ADMIN 存取
- **WHEN** SUPPORT / EDITOR 角色使用者進入 `/admin/ai-usage`
- **THEN** 系統重導到 `/admin`（無權限）

---

### Requirement: 總覽 KPI 卡
頁面 SHALL 顯示以下四個 KPI 卡（預設查詢「本月」資料）：
1. 總請求次數
2. 總 Tokens 用量（promptTokens + completionTokens）
3. 總費用（USD，標注「估算值」）
4. 平均每次費用（USD）

#### Scenario: 本月有資料
- **WHEN** 本月 `ai_usage_logs` 有記錄
- **THEN** 四個 KPI 卡顯示正確的聚合數值

#### Scenario: 本月無資料
- **WHEN** 本月 `ai_usage_logs` 無記錄
- **THEN** 四個 KPI 卡均顯示 0

---

### Requirement: 模型用量分佈
頁面 SHALL 顯示各模型（`model` 欄位）的請求數與費用分佈。

#### Scenario: 多模型資料
- **WHEN** ai_usage_logs 包含多種 model 的記錄
- **THEN** 每個 model 顯示：請求數、tokens、費用、佔比

---

### Requirement: 功能用量分佈
頁面 SHALL 顯示各功能（`feature` 欄位）的請求數分佈。

#### Scenario: 顯示功能分佈
- **WHEN** ai_usage_logs 包含不同 feature 記錄
- **THEN** 各 feature 顯示請求數及佔比（food_recognition, nutrition_chat 等）

---

### Requirement: 最近請求記錄
頁面 SHALL 顯示最近 20 筆 `ai_usage_logs` 記錄，欄位包含：時間、用戶 email、模型、tokens、費用。

#### Scenario: 顯示最近記錄
- **WHEN** ai_usage_logs 有資料
- **THEN** 表格顯示最新 20 筆，依 createdAt DESC 排序

---

### Requirement: API Route - 聚合查詢
`GET /api/admin/ai-usage` SHALL 回傳聚合統計資料，支援以下 query params：
- `startDate` / `endDate`（YYYY-MM-DD）
- `groupBy`：`model` | `feature` | `day`（預設 `model`）

#### Scenario: 依模型分組查詢
- **WHEN** 呼叫 `GET /api/admin/ai-usage?groupBy=model`
- **THEN** 回傳每個 model 的 `{ model, count, totalTokens, totalCostUsd }`

#### Scenario: 非 ADMIN 呼叫 API
- **WHEN** 非 ADMIN 使用者呼叫此 API
- **THEN** 回傳 403

---

### Requirement: AdminShell 導覽加入 AI 用量
`AdminShell.tsx` navItems SHALL 加入「AI 用量」入口，路徑 `/admin/ai-usage`，minRole `ADMIN`。

#### Scenario: ADMIN 看到導覽項目
- **WHEN** ADMIN 角色使用者進入後台
- **THEN** 側邊欄顯示「AI 用量」連結

#### Scenario: 低權限角色看不到導覽項目
- **WHEN** SUPPORT 角色使用者進入後台
- **THEN** 側邊欄不顯示「AI 用量」連結
