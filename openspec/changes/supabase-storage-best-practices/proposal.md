## Why

目前專案所有用戶上傳的圖片（AI 掃描、頭像）都直接存入 Supabase Storage，並使用原始的 Supabase Public URL 給客戶端讀取。這造成每次讀圖都耗用 Supabase 的頻寬配額，且無法享受 CDN 加速；同時前端缺乏圖片壓縮流程，上傳大型原圖浪費儲存空間。現在是改善這個架構的時機，可大幅降低流量成本並提升載入速度。

## What Changes

- **新增用戶端圖片壓縮工具**：上傳前自動壓縮並轉換為 WebP，支援不同用途的壓縮 preset（頭像 / 縮圖 / 內容圖）
- **建立 Supabase Storage 分桶策略**：依用途分為 `avatars`、`food-scans`、`thumbnails` 三個 bucket，各設定對應的 RLS 政策
- **統一 Storage URL 工具函式**：封裝 Supabase Storage URL 產生邏輯，方便日後切換 CDN 供應商
- **Cloudflare Cache Rules 設定**：為 `/storage/v1/object/public/*` 設定 1 年 TTL，讓讀圖流量走 Cloudflare 快取而非直打 Supabase
- **（進階）Cloudflare Worker 自訂域名代理**：透過 `images.{domain}` 代理 Supabase Storage，無痛切換供應商

## Capabilities

### New Capabilities
- `image-compression`: 瀏覽器端 WebP 壓縮，依用途套用不同 preset（頭像 96×96, 縮圖 400px, 內容圖 1200px）
- `storage-buckets`: Supabase Storage 分桶架構設計與 RLS 政策設定
- `storage-url-helper`: 統一的 Storage URL 工具函式，支援轉換為 Cloudflare CDN URL
- `cloudflare-cdn-setup`: Cloudflare Cache Rules 或 Worker 代理設定文件與腳本

### Modified Capabilities
- `user-auth`: 用戶頭像上傳流程需改用新的壓縮 + Storage 工具

## Impact

- **files**: `lib/client-image-compress.ts`（新增 preset）、`lib/image-upload.ts`（整合壓縮流程）、新增 `lib/storage-url.ts`
- **APIs**: `/api/auth/upload-avatar`、`/api/recognition`（scan 上傳路徑）
- **dependencies**: `browser-image-compression`（已安裝）
- **infra**: Supabase Storage bucket 設定（migration script）、Cloudflare Dashboard 設定
