# Phase 3: AI 食物辨識 - 實作總結

## 完成時間
2024年1月

## 實作概覽
成功實作 AI 食物辨識系統，使用者可透過拍照或上傳圖片，由 GPT-4 Vision 自動辨識食物並提供營養資訊。

## 技術架構

### 1. 資料庫模型
- **FoodRecognition**: 辨識記錄主表
  - id, userId, imageUrl, status, rawResult, confidence, errorMessage
  - 狀態: PROCESSING, COMPLETED, FAILED, EDITED
  
- **FoodItem**: 辨識出的食物項目
  - 營養資訊: calories, protein, carbs, fat, fiber, sugar, sodium
  - 份量資訊: portion, portionSize, portionUnit
  - 雙語名稱: name (中文), nameEn (英文)
  - 編輯標記: isEdited, confidence

### 2. AI 整合
- **OpenAI SDK**: v6.7.0
- **模型**: GPT-4o-mini (經濟型視覺模型)
- **設定**: 
  - max_tokens: 1000
  - temperature: 0.3
  - response_format: json_object
  - detail: high (高品質圖像分析)

### 3. 核心功能

#### AI 辨識邏輯 (`lib/ai/food-recognition.ts`)
```typescript
- recognizeFood(): 主要 AI 呼叫函數
- recognizeFoodWithRetry(): 重試機制 (最多2次)
- validateRecognitionResult(): 結果驗證
- FOOD_RECOGNITION_PROMPT: 詳細中文營養分析提示詞
```

#### API 端點
1. **POST /api/recognition/upload**
   - 接收圖片上傳 (最大 10MB)
   - Sharp 壓縮至 1920×1920, 85% 品質
   - 上傳至 Vercel Blob
   - 建立 PROCESSING 狀態記錄
   - 非同步觸發 AI 分析

2. **GET /api/recognition/[id]**
   - 查詢單筆辨識結果
   - 包含所有食物項目
   - 權限驗證

3. **PATCH /api/recognition/[id]**
   - 編輯食物項目
   - Zod 驗證輸入
   - 更新狀態為 EDITED

4. **DELETE /api/recognition/[id]**
   - 刪除辨識記錄
   - 級聯刪除相關食物項目

5. **GET /api/recognition**
   - 分頁查詢使用者的辨識記錄
   - 支援狀態篩選
   - 包含食物數量統計

### 4. UI 元件

#### 掃描相關
- **CameraCapture**: 相機拍照 (react-webcam)
  - 前後鏡頭切換
  - 即時預覽
  - 快門按鈕

- **ImageUpload**: 圖片上傳
  - 拖放支援
  - 檔案驗證 (類型、大小)
  - 預覽功能

- **RecognitionLoading**: 載入動畫
  - 旋轉圖示
  - 狀態訊息

#### 結果顯示
- **FoodItemCard**: 食物項目卡片
  - 雙語名稱顯示
  - 完整營養資訊
  - 信心度標籤
  - 編輯/刪除按鈕

- **NutritionSummary**: 營養總計
  - 卡路里總和
  - 三大營養素統計
  - 進度條視覺化
  - 目標對比 (可選)

### 5. 頁面實作

#### /scan (掃描頁面)
- 拍照/上傳選擇
- 圖片壓縮與上傳
- 上傳進度顯示
- 自動跳轉至結果頁

#### /scan/result/[id] (結果頁面)
- 圖片顯示
- 辨識狀態追蹤 (自動輪詢)
- 營養總計卡片
- 食物項目列表
- 編輯/刪除功能
- 儲存按鈕 (待 Phase 4 實作)

## 工作流程

1. **使用者上傳圖片** → 壓縮 → Vercel Blob
2. **建立 FoodRecognition** (status: PROCESSING)
3. **立即返回** recognition ID
4. **背景執行** AI 辨識
5. **成功**: 儲存 FoodItem → status: COMPLETED
6. **失敗**: 記錄錯誤 → status: FAILED
7. **前端輪詢** 直到狀態為 COMPLETED/FAILED
8. **顯示結果** 或錯誤訊息

## 驗證與錯誤處理

### 圖片驗證
- 檔案類型: JPG, PNG, WebP
- 檔案大小: ≤ 10MB
- 自動壓縮: 1920×1920, WebP 格式

### 食物資料驗證 (Zod Schema)
```typescript
foodItemSchema:
  - name: 1-100 字元
  - portionSize: 0.1-10000
  - calories/protein/carbs/fat: ≥ 0
  - 可選欄位: fiber, sugar, sodium
```

### 重試機制
- 指數退避: 1s → 2s → 4s
- 最多重試: 2 次
- 記錄所有錯誤

## 導航整合

### Sidebar 更新
- 新增 "AI 掃描" 選單項目
- 圖示: lucide:scan
- 路徑: /scan

### Dashboard 更新
- 右上角 "快速掃描" 按鈕
- 圖示: Scan icon
- 一鍵跳轉至掃描頁面

## 已安裝套件
- `openai@6.7.0`: OpenAI SDK
- `react-webcam@7.2.0`: 相機拍照

## 待完成事項 (Phase 4)
- 儲存辨識結果至飲食記錄
- 選擇餐次 (早/午/晚餐/點心)
- 整合每日營養統計
- 歷史記錄管理

## 測試建議

### 單元測試
- [ ] AI 辨識結果驗證
- [ ] 圖片壓縮功能
- [ ] API 錯誤處理

### 整合測試
- [ ] 完整上傳流程
- [ ] 狀態輪詢機制
- [ ] 編輯與刪除操作

### E2E 測試
- [ ] 拍照 → 辨識 → 編輯 → 儲存
- [ ] 上傳 → 辨識失敗 → 重試
- [ ] 多項食物編輯

## 效能考量

### 成本控制
- 使用 GPT-4o-mini (成本較低)
- 圖片壓縮至最大 1920×1920
- Token 限制: 1000

### 使用者體驗
- 非同步處理 (不阻塞 UI)
- 即時狀態回饋
- 自動輪詢更新
- 錯誤友善訊息

## 程式碼品質
- ✅ TypeScript strict mode
- ✅ 無 ESLint 錯誤
- ✅ 完整型別定義
- ✅ 錯誤處理完善
- ✅ 中文使用者介面

## 檔案清單

### Backend
- `prisma/schema.prisma` (FoodRecognition, FoodItem 模型)
- `lib/ai/openai-client.ts` (OpenAI 客戶端)
- `lib/ai/food-recognition.ts` (辨識邏輯)
- `lib/validations/food.ts` (Zod Schema)
- `app/api/recognition/upload/route.ts` (上傳 API)
- `app/api/recognition/[id]/route.ts` (查詢/編輯/刪除 API)
- `app/api/recognition/route.ts` (列表 API)

### Frontend
- `components/scan/camera-capture.tsx`
- `components/scan/image-upload.tsx`
- `components/scan/recognition-loading.tsx`
- `components/scan/food-item-card.tsx`
- `components/scan/nutrition-summary.tsx`
- `app/(dashboard)/scan/page.tsx`
- `app/(dashboard)/scan/result/[id]/page.tsx`

### Updated
- `components/layout/sidebar.tsx` (新增掃描選單)
- `app/(dashboard)/dashboard/page.tsx` (新增快速掃描按鈕)

## 總結
Phase 3 成功實作完整的 AI 食物辨識系統，從圖片上傳、AI 分析、結果顯示到編輯功能一應俱全。系統具備良好的錯誤處理、使用者體驗優化，並為 Phase 4 的飲食記錄整合奠定基礎。
