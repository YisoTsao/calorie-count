## ADDED Requirements

### Requirement: Cloudflare Cache Rules 快取設定
系統 SHALL 透過 Cloudflare Cache Rules 設定，讓 Supabase Storage 的公開圖片讀取走 Cloudflare 快取，減少 Supabase 頻寬消耗。

#### Scenario: 圖片讀取走快取
- **WHEN** 用戶讀取 `https://{project}.supabase.co/storage/v1/object/public/*` 的圖片
- **THEN** Cloudflare 快取命中時直接回傳，不再請求 Supabase（TTL 1 年）

#### Scenario: 首次請求回源
- **WHEN** 圖片尚未被快取
- **THEN** Cloudflare 回源至 Supabase 取得圖片並快取

### Requirement: Cloudflare Worker 代理（進階）
系統 SHOULD 提供 Cloudflare Worker 設定，以 `images.{domain}` 自訂域名代理 Supabase Storage，使前端程式碼與 Supabase 解耦。

#### Scenario: 透過自訂域名讀取圖片
- **WHEN** 前端請求 `https://images.{domain}/avatars/{path}`
- **THEN** Cloudflare Worker 代理轉發至 Supabase Storage 對應路徑並回傳圖片

#### Scenario: 切換 Storage 供應商
- **WHEN** 將 Worker 的目標 URL 從 Supabase 改為其他 object storage
- **THEN** 前端程式碼無需任何修改
