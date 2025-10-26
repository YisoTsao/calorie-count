## ADDED Requirements

### Requirement: 統一 API 回應格式
所有 API 端點 MUST 回傳統一的 JSON 格式。

#### Scenario: 成功回應
- **WHEN** API 請求成功
- **THEN** 回應格式 MUST 為:
  ```json
  {
    "success": true,
    "data": <實際資料>
  }
  ```
- **AND** HTTP 狀態碼為 2xx

#### Scenario: 錯誤回應
- **WHEN** API 請求失敗
- **THEN** 回應格式 MUST 為:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "使用者友善的錯誤訊息",
      "details": [可選的詳細資訊陣列]
    }
  }
  ```
- **AND** HTTP 狀態碼為適當的錯誤碼 (400, 401, 404, 500 等)

### Requirement: HTTP 狀態碼規範
API MUST 使用正確的 HTTP 狀態碼。

#### Scenario: 狀態碼對應
- **WHEN** 回應 API 請求
- **THEN** MUST 使用以下狀態碼:
  - 200: 成功 (GET, PUT, PATCH)
  - 201: 成功建立 (POST)
  - 204: 成功無內容 (DELETE)
  - 400: 錯誤請求 (驗證失敗)
  - 401: 未授權 (未登入或 token 無效)
  - 403: 禁止存取 (無權限)
  - 404: 資源不存在
  - 409: 衝突 (例如 email 已存在)
  - 422: 無法處理的實體 (語義錯誤)
  - 429: 請求過多 (rate limit)
  - 500: 伺服器錯誤

### Requirement: 錯誤碼命名規範
錯誤碼 MUST 使用一致的命名慣例。

#### Scenario: 標準錯誤碼
- **WHEN** 定義錯誤碼
- **THEN** MUST 使用 UPPER_SNAKE_CASE
- **AND** 包含以下標準錯誤碼:
  - VALIDATION_ERROR: 驗證失敗
  - UNAUTHORIZED: 未授權
  - FORBIDDEN: 無權限
  - NOT_FOUND: 資源不存在
  - CONFLICT: 資源衝突
  - RATE_LIMIT_EXCEEDED: 超過請求限制
  - INTERNAL_SERVER_ERROR: 伺服器內部錯誤

### Requirement: 分頁標準
所有列表 API MUST 支援分頁。

#### Scenario: 分頁參數
- **WHEN** 請求列表資料
- **THEN** 接受以下查詢參數:
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 20, 最大 100)

#### Scenario: 分頁回應
- **WHEN** 回傳列表資料
- **THEN** 回應格式 MUST 包含:
  ```json
  {
    "success": true,
    "data": {
      "items": [資料陣列],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
      }
    }
  }
  ```

### Requirement: 請求驗證
所有 API MUST 驗證請求參數。

#### Scenario: 使用 Zod 驗證
- **WHEN** 接收 API 請求
- **THEN** MUST 使用 Zod schema 驗證請求 body/query
- **AND** 驗證失敗時回傳 400 錯誤
- **AND** 錯誤訊息 MUST 指出哪個欄位有問題

#### Scenario: 驗證錯誤回應
- **WHEN** 請求驗證失敗
- **THEN** 回應格式 MUST 為:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "請求參數有誤",
      "details": [
        {
          "field": "email",
          "message": "Email 格式不正確"
        },
        {
          "field": "password",
          "message": "密碼至少需要8個字元"
        }
      ]
    }
  }
  ```

### Requirement: 認證中間件
受保護的 API MUST 驗證使用者認證。

#### Scenario: Bearer Token 認證
- **WHEN** 調用受保護的 API
- **THEN** MUST 在 Authorization header 提供 Bearer token
- **AND** 格式為: `Authorization: Bearer <access_token>`

#### Scenario: Token 驗證失敗
- **WHEN** token 無效、過期或缺少
- **THEN** 回傳 401 Unauthorized
- **AND** 錯誤訊息為 "請先登入" 或 "Token 無效"

### Requirement: Rate Limiting
API MUST 實作請求頻率限制。

#### Scenario: 超過請求限制
- **WHEN** 使用者在 1 分鐘內發送超過 100 個請求
- **THEN** 回傳 429 Too Many Requests
- **AND** 回應 header 包含:
  - X-RateLimit-Limit: 100
  - X-RateLimit-Remaining: 0
  - X-RateLimit-Reset: <重置時間戳>

### Requirement: CORS 設定
API MUST 正確設定 CORS headers。

#### Scenario: 跨域請求
- **WHEN** 前端從不同域名請求 API
- **THEN** MUST 允許來自授權域名的請求
- **AND** 設定適當的 CORS headers:
  - Access-Control-Allow-Origin
  - Access-Control-Allow-Methods
  - Access-Control-Allow-Headers
  - Access-Control-Allow-Credentials

### Requirement: 錯誤日誌記錄
系統 MUST 記錄所有 API 錯誤。

#### Scenario: 記錄錯誤詳情
- **WHEN** API 發生錯誤 (4xx, 5xx)
- **THEN** MUST 記錄以下資訊:
  - 錯誤時間
  - 請求路徑和方法
  - 使用者 ID (如果已登入)
  - 錯誤堆疊 (500 錯誤)
  - 請求參數 (不包含敏感資訊)
- **AND** 5xx 錯誤 SHOULD 發送警告通知

### Requirement: API 版本控制
API 路徑 SHOULD 包含版本號碼。

#### Scenario: API 版本路徑
- **WHEN** 設計 API 路徑
- **THEN** SHOULD 使用 `/api/v1/` 前綴
- **AND** 未來版本使用 `/api/v2/` 等
- **AND** 向下相容性維持至少一個版本
