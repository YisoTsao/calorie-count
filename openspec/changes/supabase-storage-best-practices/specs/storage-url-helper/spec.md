## ADDED Requirements

### Requirement: Storage URL 統一工具函式
系統 SHALL 提供 `lib/storage-url.ts` 工具函式，封裝所有 Supabase Storage URL 的產生邏輯，支援切換為 Cloudflare CDN 域名。

#### Scenario: 產生公開圖片 URL
- **WHEN** 呼叫 `getStorageUrl(bucket, path)` 
- **THEN** 若有設定 `NEXT_PUBLIC_CDN_BASE_URL`，回傳 `{CDN_BASE_URL}/{bucket}/{path}`；否則回傳 Supabase public URL

#### Scenario: 產生私有圖片 Signed URL
- **WHEN** 呼叫 `getSignedUrl(bucket, path, expiresIn)` 
- **THEN** 透過 Supabase SDK 產生有效期為 `expiresIn` 秒的 signed URL

#### Scenario: CDN URL 切換
- **WHEN** `NEXT_PUBLIC_CDN_BASE_URL` 環境變數被設定為 Cloudflare 自訂域名
- **THEN** 所有公開圖片 URL 自動切換為 Cloudflare 域名，不需修改任何頁面程式碼
