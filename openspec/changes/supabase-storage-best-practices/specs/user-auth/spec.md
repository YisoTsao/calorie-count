## MODIFIED Requirements

### Requirement: User Avatar Upload
用戶 SHALL 能夠上傳頭像圖片，系統會在瀏覽器端壓縮（96×96px WebP, ≤200KB）後存入 `avatars` bucket，並透過 `getStorageUrl()` 工具函式取得 URL。

#### Scenario: 成功上傳頭像
- **WHEN** 用戶選擇圖片並送出
- **THEN** 系統壓縮為 WebP → 上傳至 `avatars/{userId}/{timestamp}.webp` → 更新 User 資料表的 `image` 欄位為新 URL

#### Scenario: 頭像 URL 讀取
- **WHEN** 任何頁面顯示用戶頭像
- **THEN** 使用 `getStorageUrl('avatars', path)` 取得 URL（自動支援 CDN 切換）
