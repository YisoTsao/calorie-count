## ADDED Requirements

### Requirement: Storage Bucket 分桶架構
系統 SHALL 使用三個獨立 bucket 存放不同用途的圖片，並設定對應的 RLS 政策。

#### Scenario: 頭像 bucket 公開讀取
- **WHEN** 任何人（含未登入）請求 `avatars/{userId}/{filename}` 的 public URL
- **THEN** 系統返回圖片內容（不需 Auth token）

#### Scenario: 掃描圖 bucket 私有存取
- **WHEN** 已登入用戶請求 `food-scans/{userId}/{filename}`
- **THEN** 系統返回圖片內容（需有效 JWT）

#### Scenario: 其他用戶無法讀取私有掃描圖
- **WHEN** 用戶 A 嘗試讀取用戶 B 的 `food-scans` 圖片
- **THEN** 系統返回 403 Forbidden

### Requirement: 檔案命名與大小限制
系統 SHALL 強制執行上傳檔案的命名規則與大小限制。

#### Scenario: 頭像大小超限
- **WHEN** 壓縮後頭像仍超過 200KB
- **THEN** 系統拒絕上傳並回傳錯誤訊息

#### Scenario: 掃描圖命名規則
- **WHEN** 用戶上傳掃描圖
- **THEN** 系統以 `{userId}/{timestamp}-{uuid}.webp` 格式命名，避免覆蓋舊圖
