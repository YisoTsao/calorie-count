## Context

目前架構：用戶上傳原圖 → 直接存 Supabase Storage → 前端讀 Supabase Public URL。
問題：1) 無壓縮，5MB 手機照片佔用大量儲存；2) 每次讀圖耗用 Supabase 頻寬額度（免費方案 1GB/月）；3) 無 CDN 加速。

專案已有 `browser-image-compression` 套件與 `lib/client-image-compress.ts`，但缺乏統一的 preset 與上傳流程整合。

## Goals / Non-Goals

**Goals:**
- 上傳前在瀏覽器端壓縮圖片，轉為 WebP，減少 60-80% 檔案大小
- 設計三個 Supabase Storage bucket（`avatars`、`food-scans`、`thumbnails`）並設定 RLS
- 封裝 Storage URL 工具函式，支援切換為 Cloudflare CDN 域名
- 提供 Cloudflare Cache Rules 設定方案（TTL 1 年），讓讀圖流量走快取
- 提供 Cloudflare Worker 代理方案（進階，可選）

**Non-Goals:**
- 不修改現有已存圖片（不做資料遷移）
- 不實作圖片的伺服器端處理（resize / WebP 轉換在客戶端完成即可）
- 不更換 Supabase Storage 為其他 object storage

## Decisions

### D1：壓縮在客戶端（Browser）而非伺服器端

**選擇**：`browser-image-compression` 在 upload 前於瀏覽器壓縮。

**理由**：降低伺服器負載，減少上傳流量（不需上傳大圖再下傳壓縮結果）；Supabase Edge Functions 有執行時間限制，不適合做圖片處理。

**捨棄方案**：Supabase Storage Transformation（需付費方案）；Cloudflare Images（額外費用）。

### D2：強制轉為 WebP 格式

**選擇**：所有壓縮圖片輸出 WebP。

**理由**：相較 JPEG 小 25-35%，相較 PNG 小 70-80%；現代瀏覽器覆蓋率 >97%。

### D3：Cloudflare Cache Rules（簡單方案）優先

**選擇**：先設定 Cache Rules 讓讀圖走快取，Worker 代理設為可選進階步驟。

**理由**：Cache Rules 設定 5 分鐘，Worker 需要額外部署與維護成本；功能上 Cache Rules 已足夠解決流量問題。

### D4：三個 bucket 的設計

| Bucket | 存放 | 公開？ | 大小限制 |
|--------|------|--------|---------|
| `avatars` | 用戶頭像 | ✓ 公開 | 200KB |
| `food-scans` | AI 掃描原圖 | ✗ 需 Auth | 2MB |
| `thumbnails` | 掃描縮圖 | ✓ 公開 | 200KB |

## Risks / Trade-offs

- **WebP 不支援老舊瀏覽器** → 目標用戶為手機 App，覆蓋率可接受；若有疑慮可 fallback 為 JPEG
- **壓縮品質與大小的平衡** → 使用內容圖 quality=0.8、頭像 quality=0.9 作為預設值，可調整
- **Cloudflare Cache TTL 過長導致更新延遲** → 頭像更新應帶版本號（用 userId + timestamp 命名），避免快取污染

## Migration Plan

1. 建立 Supabase bucket（執行 migration script）
2. 新增 `lib/storage-url.ts`
3. 更新 `lib/client-image-compress.ts` 加入 preset
4. 更新 API upload 路徑使用新 bucket
5. 設定 Cloudflare Cache Rules（Dashboard 手動操作，附文件）
6. 逐步切換：頭像 → 掃描圖

## Open Questions

- Cloudflare Worker 代理是否需要自訂域名（`images.{domain}`）？還是 Cache Rules 就足夠？
- `food-scans` bucket 私有存取時，需要 signed URL，有效期多長合適？
