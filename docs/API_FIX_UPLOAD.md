# API 修復說明：/api/recognition/upload

## 問題診斷
上傳 API 失敗的原因是缺少 **Vercel Blob** 的環境變數 `BLOB_READ_WRITE_TOKEN`。

在生產環境（Vercel）中，這個 token 會自動提供，但在本地開發環境中需要手動設定或使用替代方案。

## 解決方案

### 1. 雙模式儲存策略
修改 `/app/api/recognition/upload/route.ts`，支援兩種儲存方式：

#### 生產環境 (有 BLOB_READ_WRITE_TOKEN)
- 使用 **Vercel Blob** 雲端儲存
- 圖片上傳至 Vercel CDN
- 獲得公開可訪問的 URL

#### 開發環境 (無 BLOB_READ_WRITE_TOKEN)
- 使用**本地檔案系統**儲存
- 圖片儲存在 `public/uploads/food-recognition/{userId}/` 目錄
- 生成相對 URL: `/uploads/food-recognition/{userId}/{timestamp}.webp`

### 2. 修改內容

```typescript
// 新增判斷邏輯
const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

// 根據環境選擇儲存方式
if (hasVercelBlob) {
  // Vercel Blob (生產環境)
  const blob = await put(fileName, compressedBuffer, {
    access: 'public',
    contentType: 'image/webp',
  });
  imageUrl = blob.url;
} else {
  // 本地檔案系統 (開發環境)
  const publicDir = join(process.cwd(), 'public', 'uploads', 'food-recognition');
  const userDir = join(publicDir, session.user.id);
  await mkdir(userDir, { recursive: true });
  await writeFile(filePath, compressedBuffer);
  imageUrl = `/uploads/food-recognition/${session.user.id}/${fileName}`;
}
```

### 3. AI 辨識 URL 處理

OpenAI Vision API 需要**完整的 HTTP URL**，因此在開發環境中需要將相對 URL 轉換：

```typescript
async function processRecognition(recognitionId: string, imageUrl: string) {
  // 如果是相對 URL，轉換為完整 URL
  let fullImageUrl = imageUrl;
  if (imageUrl.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fullImageUrl = `${baseUrl}${imageUrl}`;
  }
  
  // 呼叫 AI 辨識
  const result = await recognizeFoodWithRetry(fullImageUrl);
}
```

### 4. 目錄結構調整

建立上傳目錄：
```
public/
  uploads/
    food-recognition/
      .gitkeep          # 保留目錄結構
      {userId}/         # 每個使用者的子目錄（運行時建立）
        {timestamp}.webp
```

### 5. .gitignore 更新

```gitignore
# uploads
/public/uploads/*
!/public/uploads/food-recognition/.gitkeep
```

這樣可以：
- 忽略所有上傳的檔案
- 保留目錄結構檔案 (.gitkeep)

## 測試步驟

### 開發環境測試
1. 確保沒有設定 `BLOB_READ_WRITE_TOKEN`
2. 啟動開發伺服器: `bun dev`
3. 訪問 `/scan` 頁面
4. 上傳或拍攝食物圖片
5. 檢查 `public/uploads/food-recognition/{userId}/` 目錄是否建立
6. 確認圖片上傳成功
7. 等待 AI 辨識完成

### 預期結果
- ✅ 圖片成功壓縮並儲存到本地
- ✅ FoodRecognition 記錄建立（status: PROCESSING）
- ✅ AI 成功辨識圖片（使用完整 URL）
- ✅ 狀態更新為 COMPLETED
- ✅ FoodItem 記錄建立

### 生產環境部署
在 Vercel 部署時：
1. Vercel 會自動提供 `BLOB_READ_WRITE_TOKEN`
2. 系統自動切換到 Vercel Blob 儲存
3. 無需額外設定

## 環境變數檢查表

### 必需（所有環境）
- ✅ `OPENAI_API_KEY` - OpenAI API 金鑰
- ✅ `NEXT_PUBLIC_APP_URL` - 應用程式基礎 URL
- ✅ `DATABASE_URL` - PostgreSQL 連線字串
- ✅ `NEXTAUTH_SECRET` - NextAuth 密鑰

### 可選（生產環境）
- ⚪ `BLOB_READ_WRITE_TOKEN` - Vercel Blob token（Vercel 自動提供）

## 常見錯誤排查

### 1. "OPENAI_API_KEY is not set"
**原因**: `.env` 檔案中未設定 OpenAI API key
**解決**: 在 `.env` 中添加 `OPENAI_API_KEY=sk-...`

### 2. "ENOENT: no such file or directory"
**原因**: 上傳目錄不存在
**解決**: 程式碼已自動建立，如仍失敗請手動建立 `public/uploads/food-recognition/`

### 3. "Invalid recognition result"
**原因**: AI 返回的資料格式不符合預期
**解決**: 檢查 `lib/ai/food-recognition.ts` 中的驗證邏輯

### 4. AI 辨識一直 PROCESSING
**原因**: 
- OpenAI API 金鑰無效
- 圖片 URL 無法訪問
- API 配額用盡

**解決**: 
- 檢查 API 金鑰是否正確
- 確認本地開發伺服器運行在 3000 port
- 檢查 OpenAI 帳戶使用情況

## 效能優化

### 圖片壓縮設定
```typescript
await compressImage(buffer, {
  maxWidth: 1920,    // 最大寬度
  maxHeight: 1920,   // 最大高度
  quality: 85,       // 品質 (0-100)
  format: 'webp',    // 使用 WebP 格式
});
```

### AI 成本控制
- 模型: `gpt-4o-mini` (經濟型)
- Max tokens: 1000
- Temperature: 0.3
- 預估成本: ~$0.01 per image

## 後續改進建議

1. **圖片清理機制**
   - 定期清理開發環境的舊圖片
   - 實作圖片過期刪除

2. **錯誤重試 UI**
   - 辨識失敗時提供重試按鈕
   - 顯示更詳細的錯誤訊息

3. **圖片預覽**
   - 上傳前顯示圖片預覽
   - 允許裁切/旋轉

4. **批次上傳**
   - 支援一次上傳多張圖片
   - 並行處理 AI 辨識

## 修改檔案清單

- ✅ `app/api/recognition/upload/route.ts` - 雙模式儲存邏輯
- ✅ `.gitignore` - 忽略上傳檔案
- ✅ `public/uploads/food-recognition/.gitkeep` - 保留目錄結構
