## ADDED Requirements

### Requirement: 上傳前圖片壓縮
系統 SHALL 在用戶上傳圖片至 Supabase Storage 之前，在瀏覽器端自動壓縮圖片並轉為 WebP 格式。

#### Scenario: 頭像壓縮
- **WHEN** 用戶選擇頭像圖片（任意格式）
- **THEN** 系統以 96×96px、quality=0.9 壓縮為 WebP，大小不超過 200KB 後上傳

#### Scenario: 掃描圖壓縮
- **WHEN** 用戶上傳食物掃描照片
- **THEN** 系統以最長邊 1200px、quality=0.8 壓縮為 WebP，大小不超過 2MB 後上傳

#### Scenario: 壓縮失敗 fallback
- **WHEN** 瀏覽器不支援 WebP 輸出
- **THEN** 系統退回使用 JPEG 格式（quality=0.85）並繼續上傳流程
