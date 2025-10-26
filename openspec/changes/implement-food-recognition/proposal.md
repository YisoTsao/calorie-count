# 變更提案: 實作 AI 食物辨識功能

## 📋 變更資訊
- **變更名稱**: implement-food-recognition
- **建立日期**: 2025-10-25
- **預估時間**: 3-4 天
- **優先級**: High (核心功能)
- **依賴**: init-project-foundation, implement-user-management

## 🎯 為什麼要做這個變更?

### 背景
這是整個應用程式的**核心功能**和**最大賣點**。傳統的卡路里追蹤 App 需要使用者手動輸入或搜尋食物,過程繁瑣且容易放棄。透過 AI 圖片辨識,使用者只需拍照即可自動識別食物和營養資訊,大幅降低使用門檻。

### 問題
- 手動輸入食物資料耗時費力
- 使用者難以估計食物份量
- 搜尋食物資料庫效率低
- 新手不了解食物的營養成分

### 價值
- **核心競爭力**: AI 辨識是產品的主要差異化特色
- **提升使用體驗**: 拍照即可記錄,降低 90% 的輸入時間
- **提高準確度**: AI 可以識別多種食物和估算份量
- **教育價值**: 使用者可以學習不同食物的營養成分
- **增加黏著度**: 便利性提高每日使用頻率

## 📦 這個變更會做什麼?

### 主要功能模組

#### 1. 圖片上傳與處理
- 相機拍照功能 (移動裝置)
- 從相簿選擇照片
- 圖片預覽與旋轉
- 圖片壓縮 (節省流量和成本)
- 支援多張圖片上傳

#### 2. AI 辨識整合
- 整合 OpenAI Vision API (GPT-4 Vision)
- 設計 Prompt 工程
  - 識別食物名稱
  - 估算份量
  - 計算營養資訊
  - 辨識多種食物
- 處理辨識失敗的情況
- 成本控制與限流

#### 3. 辨識結果展示
- 顯示辨識的食物清單
- 每項食物的營養資訊
  - 卡路里
  - 蛋白質
  - 碳水化合物
  - 脂肪
  - 纖維 (可選)
- 份量資訊
- 可信度評分

#### 4. 結果編輯與調整
- 修改食物名稱
- 調整份量 (增加/減少)
- 編輯營養資訊
- 新增/刪除食物項目
- 合併相同食物

#### 5. 儲存到飲食記錄
- 選擇用餐時段 (早餐/午餐/晚餐/點心)
- 新增備註
- 儲存到資料庫
- 更新每日營養統計

### 技術實作

#### 資料庫 Schema
```prisma
model FoodRecognition {
  id          String   @id @default(cuid())
  userId      String
  imageUrl    String   // 上傳的圖片
  status      RecognitionStatus @default(PROCESSING)
  
  // AI 辨識原始結果
  rawResult   Json?
  confidence  Float?   // 0-1
  
  // 處理後的食物列表
  foods       FoodItem[]
  
  // 關聯到飲食記錄
  mealRecordId String?
  mealRecord   MealRecord? @relation(fields: [mealRecordId], references: [id])
  
  user        User @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FoodItem {
  id          String @id @default(cuid())
  recognitionId String
  
  name        String   // 食物名稱
  nameEn      String?  // 英文名稱
  portion     String   // 份量描述
  portionSize Float    // 份量數值
  portionUnit String   // 份量單位
  
  // 營養資訊 (每份)
  calories    Float
  protein     Float
  carbs       Float
  fat         Float
  fiber       Float?
  sugar       Float?
  sodium      Float?
  
  // 是否已編輯
  isEdited    Boolean @default(false)
  
  recognition FoodRecognition @relation(fields: [recognitionId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum RecognitionStatus {
  PROCESSING  // 處理中
  COMPLETED   // 已完成
  FAILED      // 失敗
  EDITED      // 已編輯
}
```

#### API Endpoints
- `POST /api/recognition/upload` - 上傳圖片
- `GET /api/recognition/:id` - 取得辨識結果
- `PATCH /api/recognition/:id` - 編輯辨識結果
- `POST /api/recognition/:id/save` - 儲存到飲食記錄
- `DELETE /api/recognition/:id` - 刪除辨識記錄

#### 新增頁面
- `/dashboard/scan` - AI 辨識主頁面
- `/dashboard/scan/result/[id]` - 辨識結果頁面
- `/dashboard/scan/history` - 辨識歷史記錄

#### 核心元件
- `CameraCapture` - 相機拍照
- `ImageUpload` - 圖片上傳
- `ImagePreview` - 圖片預覽
- `RecognitionLoading` - 辨識載入動畫
- `FoodItemCard` - 食物項目卡片
- `FoodItemEditor` - 食物編輯表單
- `PortionAdjuster` - 份量調整器
- `NutritionSummary` - 營養摘要
- `SaveToMealDialog` - 儲存對話框

## 🎨 影響範圍

### 新增檔案 (約 25+ 個)
- Prisma Schema 擴展
- API Routes (5 個)
- Pages (3 個)
- Components (10+ 個)
- Utilities (圖片處理、AI 整合)
- Types 定義

### 修改檔案
- `openapi.yaml` - 新增 API 規格
- 導航選單 - 新增「掃描」入口
- 儀表板 - 新增快速掃描按鈕

### 新增套件
- `@vercel/blob` 或 `cloudinary` - 圖片儲存
- `sharp` - 圖片壓縮
- `react-webcam` - 相機功能
- `openai` - OpenAI API

## ✅ 成功標準

### 功能完整性
- [ ] 使用者可以拍照或上傳圖片
- [ ] AI 可以成功辨識常見食物 (準確率 > 80%)
- [ ] 辨識結果包含完整的營養資訊
- [ ] 使用者可以編輯辨識結果
- [ ] 可以儲存到飲食記錄
- [ ] 處理辨識失敗的情況

### 使用者體驗
- [ ] 上傳流程順暢,步驟清晰
- [ ] 辨識速度 < 10 秒
- [ ] 結果展示清晰易懂
- [ ] 編輯操作直覺方便
- [ ] 錯誤訊息友善且有解決方案

### 技術品質
- [ ] 圖片上傳有進度顯示
- [ ] 圖片壓縮減少流量消耗
- [ ] API 有完整錯誤處理
- [ ] OpenAI API 有重試機制
- [ ] 成本控制機制 (每日/每月限制)

### 效能目標
- [ ] 圖片上傳 < 3 秒
- [ ] AI 辨識回應 < 10 秒
- [ ] 頁面載入 < 2 秒
- [ ] 圖片壓縮後 < 500KB

## 🔄 後續步驟

完成此變更後,進入 **Phase 4: 飲食記錄管理**,建立完整的每日飲食追蹤功能。

## 💡 技術考量

### Prompt Engineering
設計有效的 prompt 來提高辨識準確度:
```
Analyze this food image and return a JSON with:
1. List of all foods visible
2. Estimated portion sizes
3. Nutritional information per serving
4. Confidence score (0-1)

Format:
{
  "foods": [
    {
      "name": "白飯",
      "nameEn": "White Rice",
      "portion": "1碗",
      "portionSize": 200,
      "portionUnit": "g",
      "calories": 260,
      "protein": 5,
      "carbs": 58,
      "fat": 0.5,
      "confidence": 0.95
    }
  ]
}
```

### 成本控制
- 使用圖片壓縮減少 tokens 消耗
- 實作每日免費額度 (如 10 次/天)
- 付費用戶無限次數
- 快取常見食物辨識結果

### 備用方案
- 如果 OpenAI API 失敗,允許手動輸入
- 提供常見食物快速選擇
- 整合第三方營養資料庫 API
