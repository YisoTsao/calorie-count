## 1. 基礎工具建立

- [ ] 1.1 在 `lib/client-image-compress.ts` 新增 `compressForAvatar`、`compressForScan`、`compressForThumbnail` 三個 preset 函式（使用 `browser-image-compression`，輸出 WebP）
- [ ] 1.2 建立 `lib/storage-url.ts`，實作 `getStorageUrl(bucket, path)` 與 `getSignedUrl(bucket, path, expiresIn)` 函式
- [ ] 1.3 在 `.env.local` 和 `.env.example` 加入 `NEXT_PUBLIC_CDN_BASE_URL` 環境變數（預設空值）

## 2. Supabase Storage Bucket 設定

- [ ] 2.1 在 Supabase Dashboard 建立 `avatars` bucket（public: true，file size limit: 200KB）
- [ ] 2.2 在 Supabase Dashboard 建立 `food-scans` bucket（public: false，file size limit: 2MB）
- [ ] 2.3 在 Supabase Dashboard 建立 `thumbnails` bucket（public: true，file size limit: 200KB）
- [ ] 2.4 為 `food-scans` bucket 設定 RLS 政策：owner 才能 SELECT / INSERT / DELETE
- [ ] 2.5 為 `avatars` bucket 設定 RLS 政策：INSERT/UPDATE/DELETE 限 owner，SELECT 公開

## 3. 頭像上傳整合

- [ ] 3.1 更新 `lib/image-upload.ts` 使用 `compressForAvatar` 壓縮後上傳至 `avatars` bucket
- [ ] 3.2 更新 API 路由（`/api/auth/upload-avatar` 或相關路由）使用 `getStorageUrl` 回傳 URL
- [ ] 3.3 更新頭像顯示元件，改用 `getStorageUrl('avatars', path)` 取得 URL

## 4. 掃描圖上傳整合

- [ ] 4.1 更新 `/api/recognition` 上傳流程，先壓縮（`compressForScan`）再存至 `food-scans` bucket
- [ ] 4.2 更新掃描結果頁面，改用 signed URL 或 thumbnails bucket URL 顯示圖片
- [ ] 4.3 確認掃描圖命名格式為 `{userId}/{timestamp}-{uuid}.webp`

## 5. Cloudflare Cache 設定

- [ ] 5.1 在 `docs/CLOUDFLARE_CACHE_SETUP.md` 建立 Cloudflare Cache Rules 設定教學（截圖步驟、TTL 1 年、URI Match 規則）
- [ ] 5.2 在 `docs/CLOUDFLARE_WORKER_PROXY.md` 建立 Worker 代理設定教學（含 `images.{domain}` 自訂域名設定）
- [ ] 5.3 撰寫 Cloudflare Worker 範例程式碼（代理 Supabase Storage 至自訂域名）

## 6. 驗證

- [ ] 6.1 驗證頭像上傳：確認壓縮後 ≤200KB、格式為 WebP、存入 `avatars` bucket
- [ ] 6.2 驗證掃描圖上傳：確認壓縮後 ≤2MB、存入 `food-scans` bucket、其他用戶無法讀取
- [ ] 6.3 驗證 `getStorageUrl` 在有無 `NEXT_PUBLIC_CDN_BASE_URL` 時回傳正確 URL
- [ ] 6.4 驗證 Cloudflare Cache Rules 套用後，Supabase 頻寬計量不再增加（第二次讀取命中快取）
