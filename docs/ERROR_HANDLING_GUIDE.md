# 完整錯誤處理與預防指南

## 已解決的錯誤

### 1. ✅ Sharp 模組載入失敗
**錯誤訊息**:
```
Error: Could not load the "sharp" module using the darwin-x64 runtime
```

**原因**: 
- Sharp 是原生模組，需要針對不同平台編譯
- Bun 與 Sharp 的二進制相容性問題

**解決方案**:
- **移除伺服器端圖片壓縮**
- **改用客戶端壓縮** (瀏覽器 Canvas API)
- 建立 `lib/client-image-compress.ts`
- 在前端壓縮圖片後再上傳

**優點**:
- 無需原生依賴
- 減少伺服器負載
- 節省頻寬
- 更快的使用者體驗

---

### 2. ✅ Vercel Blob Token 缺失
**錯誤訊息**:
```
Vercel Blob token not found
```

**解決方案**:
- 實作雙模式儲存
- 開發環境：本地檔案系統
- 生產環境：Vercel Blob

---

## 其他可能的錯誤與解決方案

### 3. OpenAI API 相關錯誤

#### 3.1 API Key 無效
**錯誤訊息**:
```
Error: Incorrect API key provided
```

**檢查**:
```bash
# 確認 .env 中的 OPENAI_API_KEY
cat .env | grep OPENAI_API_KEY
```

**解決**:
1. 到 [OpenAI Platform](https://platform.openai.com/api-keys) 生成新 key
2. 更新 `.env` 檔案
3. 重啟開發伺服器

#### 3.2 API 配額用盡
**錯誤訊息**:
```
Error: You exceeded your current quota
```

**解決**:
1. 檢查 OpenAI 帳戶餘額
2. 新增付費方式
3. 或使用新的 API key

#### 3.3 Rate Limit
**錯誤訊息**:
```
Error: Rate limit exceeded
```

**解決**:
- 已實作重試機制（最多 2 次）
- 增加延遲時間
- 升級 API tier

#### 3.4 圖片 URL 無法訪問
**錯誤訊息**:
```
Error: Failed to download image
```

**原因**:
- 本地 URL 無法被 OpenAI 訪問
- 防火牆阻擋

**解決**:
- 確認 `NEXT_PUBLIC_APP_URL` 正確設定
- 開發環境使用 `http://localhost:3000`
- 確保圖片可公開訪問

---

### 4. 資料庫錯誤

#### 4.1 Prisma Client 未生成
**錯誤訊息**:
```
Error: @prisma/client did not initialize yet
```

**解決**:
```bash
bunx prisma generate
```

#### 4.2 資料庫連線失敗
**錯誤訊息**:
```
Error: Can't reach database server
```

**檢查**:
```bash
# 確認 Docker 容器運行中
docker ps | grep postgres

# 重啟容器
docker restart calorie-count-postgres
```

#### 4.3 Migration 錯誤
**錯誤訊息**:
```
Error: Migration failed
```

**解決**:
```bash
# 重置開發資料庫（警告：會刪除所有資料）
bunx prisma migrate reset

# 重新執行 migration
bunx prisma migrate dev
```

---

### 5. 檔案系統錯誤

#### 5.1 權限不足
**錯誤訊息**:
```
Error: EACCES: permission denied
```

**解決**:
```bash
# 修正目錄權限
chmod -R 755 public/uploads
```

#### 5.2 磁碟空間不足
**錯誤訊息**:
```
Error: ENOSPC: no space left on device
```

**解決**:
```bash
# 檢查磁碟空間
df -h

# 清理上傳檔案
rm -rf public/uploads/food-recognition/*
```

#### 5.3 路徑錯誤
**錯誤訊息**:
```
Error: ENOENT: no such file or directory
```

**解決**:
- 程式碼已自動建立目錄 (`mkdir -p`)
- 手動建立：`mkdir -p public/uploads/food-recognition`

---

### 6. Next.js 相關錯誤

#### 6.1 Module Not Found
**錯誤訊息**:
```
Module not found: Can't resolve '@/...'
```

**解決**:
1. 檢查 `tsconfig.json` 的 paths 設定
2. 重啟開發伺服器
3. 刪除 `.next` 快取：`rm -rf .next`

#### 6.2 Hydration 錯誤
**錯誤訊息**:
```
Error: Hydration failed
```

**原因**:
- 伺服器與客戶端渲染不一致

**解決**:
- 使用 `'use client'` directive
- 避免在 SSR 中使用瀏覽器 API

#### 6.3 API Route 404
**錯誤訊息**:
```
404: API route not found
```

**檢查**:
1. 檔案路徑正確：`app/api/recognition/upload/route.ts`
2. 檔案名稱必須是 `route.ts`
3. 重啟開發伺服器

---

### 7. 網路相關錯誤

#### 7.1 CORS 錯誤
**錯誤訊息**:
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**解決**:
- 確認使用相同 origin
- 開發環境應該都在 localhost:3000

#### 7.2 Timeout
**錯誤訊息**:
```
Error: Request timeout
```

**原因**:
- AI 辨識時間過長
- 網路緩慢

**解決**:
- 已實作非同步處理
- 前端輪詢狀態
- 增加 timeout 限制

---

### 8. 認證錯誤

#### 8.1 Session 過期
**錯誤訊息**:
```
401: Unauthorized
```

**解決**:
- 重新登入
- 檢查 `NEXTAUTH_SECRET` 設定

#### 8.2 CSRF Token 錯誤
**錯誤訊息**:
```
Error: CSRF token mismatch
```

**解決**:
- 清除 cookies
- 重新登入

---

## 偵錯工具

### 1. 檢查環境變數
```bash
# 顯示所有環境變數（移除敏感資訊）
cat .env | grep -v "SECRET\|KEY" | grep -v "^#"
```

### 2. 檢查服務狀態
```bash
# 資料庫
docker ps | grep postgres

# Next.js 開發伺服器
lsof -i :3000
```

### 3. 檢查日誌
```bash
# 檢查 Next.js 日誌
tail -f .next/trace

# 檢查 Docker 日誌
docker logs calorie-count-postgres
```

### 4. 測試 API
```bash
# 測試上傳 API
curl -X POST http://localhost:3000/api/recognition/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "image=@test.jpg"
```

---

## 效能優化

### 1. 圖片壓縮設定
```typescript
// 調整壓縮參數以平衡品質與檔案大小
compressImageFromSrc(imageSrc, {
  maxWidth: 1920,      // 降低可加快處理
  maxHeight: 1920,
  quality: 0.85,       // 0.7-0.9 之間
  format: 'image/webp' // WebP 比 JPEG 小 25-35%
});
```

### 2. AI 成本控制
```typescript
// lib/ai/openai-client.ts
export const MAX_TOKENS = 1000;      // 降低以節省成本
export const TEMPERATURE = 0.3;      // 提高一致性
```

### 3. 資料庫查詢優化
```typescript
// 使用 select 限制欄位
const recognition = await prisma.foodRecognition.findUnique({
  where: { id },
  select: {
    id: true,
    imageUrl: true,
    status: true,
    foods: {
      select: {
        name: true,
        calories: true,
        // 只選擇需要的欄位
      }
    }
  }
});
```

---

## 監控建議

### 1. 錯誤追蹤
- 使用 Sentry 或類似服務
- 記錄所有 API 錯誤
- 追蹤 AI 辨識失敗率

### 2. 效能監控
- 監控 API 回應時間
- 追蹤圖片上傳速度
- AI 辨識成功率

### 3. 成本監控
- OpenAI API 使用量
- Vercel Blob 儲存空間
- 資料庫查詢次數

---

## 預防性維護

### 1. 定期清理
```bash
# 清理舊的上傳檔案（開發環境）
find public/uploads -type f -mtime +7 -delete

# 清理失敗的辨識記錄
bunx prisma studio
# 手動刪除 status=FAILED 且超過 7 天的記錄
```

### 2. 定期更新
```bash
# 更新依賴套件
bun update

# 檢查過時套件
bun outdated
```

### 3. 備份
```bash
# 備份資料庫
docker exec calorie-count-postgres pg_dump -U postgres calorie_count > backup.sql

# 還原資料庫
docker exec -i calorie-count-postgres psql -U postgres calorie_count < backup.sql
```

---

## 常見問題 FAQ

### Q1: 為什麼要移除 Sharp？
A: Sharp 是原生模組，在不同平台需要重新編譯，容易出現相容性問題。客戶端壓縮更穩定且減少伺服器負載。

### Q2: 前端壓縮會影響品質嗎？
A: Canvas API 可以保持高品質，WebP 格式在相同品質下比 JPEG 小 25-35%。

### Q3: AI 辨識失敗怎麼辦？
A: 系統會自動重試 2 次。如仍失敗，可以查看錯誤訊息並手動重試。

### Q4: 如何減少 OpenAI 成本？
A: 
1. 使用 gpt-4o-mini（已採用）
2. 壓縮圖片減少 token 使用
3. 降低 MAX_TOKENS 限制
4. 快取常見食物辨識結果

### Q5: 生產環境需要什麼設定？
A:
1. 設定正確的 `NEXT_PUBLIC_APP_URL`
2. Vercel 會自動提供 `BLOB_READ_WRITE_TOKEN`
3. 使用正式的 `NEXTAUTH_SECRET`
4. 設定 OpenAI API key

---

## 緊急處理流程

### 1. 服務完全無法運作
```bash
# 1. 重啟所有服務
docker restart calorie-count-postgres
rm -rf .next
bun dev

# 2. 檢查環境變數
cat .env

# 3. 重新生成 Prisma Client
bunx prisma generate

# 4. 檢查資料庫連線
bunx prisma studio
```

### 2. AI 辨識全部失敗
```bash
# 1. 檢查 OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 2. 檢查餘額
# 訪問 https://platform.openai.com/usage

# 3. 測試簡單請求
# 使用 Postman 或 curl 測試 OpenAI API
```

### 3. 資料庫損壞
```bash
# 1. 備份當前狀態
docker exec calorie-count-postgres pg_dump -U postgres calorie_count > emergency_backup.sql

# 2. 重置資料庫
bunx prisma migrate reset

# 3. 恢復資料（如果備份正常）
docker exec -i calorie-count-postgres psql -U postgres calorie_count < emergency_backup.sql
```

---

**最後更新**: 2025年10月26日  
**維護者**: GitHub Copilot
