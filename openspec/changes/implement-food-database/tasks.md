# 實作食物資料庫 - 任務清單

預估時間: 3-4 天

## 1. 資料庫 Schema (4 tasks)
- [ ] 新增 FoodCategory model 到 Prisma schema
- [ ] 新增 Food model 到 Prisma schema
- [ ] 新增 Brand model 到 Prisma schema
- [ ] 新增 FoodFavorite model 到 Prisma schema
- [ ] 執行 migration

## 2. 資料種子 (Seed Data) (5 tasks)
- [ ] 建立食物分類資料 (主分類 + 子分類)
- [ ] 匯入台灣常見食物資料 (100+ 項)
- [ ] 匯入品牌資料 (7-11, 全家, 萊爾富等)
- [ ] 建立 prisma/seed/foods.ts
- [ ] 執行 seed 指令

## 3. 第三方 API 整合 (6 tasks)
- [ ] lib/integrations/usda-api.ts - USDA API client
- [ ] lib/integrations/taiwan-fda.ts - 台灣食品資料庫
- [ ] lib/integrations/openfoodfacts.ts - Open Food Facts API
- [ ] lib/integrations/barcode-scanner.ts - 條碼掃描整合
- [ ] 建立 API keys 環境變數
- [ ] 建立 API 錯誤處理與重試機制

## 4. 搜尋系統 (4 tasks)
- [ ] 安裝 @prisma/client full-text search 或 Algolia
- [ ] lib/search/food-search.ts - 食物搜尋引擎
- [ ] 實作模糊搜尋 (fuzzy search)
- [ ] 實作搜尋建議 (autocomplete)

## 5. API Routes (12 tasks)
### 食物 CRUD
- [ ] GET /api/foods?q=&category=&brand= - 搜尋食物
- [ ] GET /api/foods/[id] - 取得食物詳情
- [ ] POST /api/foods - 新增自訂食物
- [ ] PATCH /api/foods/[id] - 更新自訂食物
- [ ] DELETE /api/foods/[id] - 刪除自訂食物

### 分類
- [ ] GET /api/food-categories - 取得所有分類
- [ ] GET /api/food-categories/[id]/foods - 取得分類下的食物

### 品牌
- [ ] GET /api/brands - 取得所有品牌
- [ ] GET /api/brands/[id]/foods - 取得品牌下的食物

### 收藏
- [ ] POST /api/foods/[id]/favorite - 收藏食物
- [ ] DELETE /api/foods/[id]/favorite - 取消收藏
- [ ] GET /api/foods/favorites - 取得收藏清單

## 6. UI 元件 (10 tasks)
- [ ] FoodSearchBar - 搜尋欄 (autocomplete)
- [ ] FoodSearchResults - 搜尋結果列表
- [ ] FoodCard - 食物卡片
- [ ] FoodDetailModal - 食物詳情彈窗
- [ ] FoodCategoryFilter - 分類篩選器
- [ ] BrandFilter - 品牌篩選器
- [ ] AddCustomFoodDialog - 新增自訂食物對話框
- [ ] NutritionLabel - 營養標籤元件
- [ ] BarcodeScannerButton - 條碼掃描按鈕
- [ ] FavoriteFoodsList - 收藏食物列表

## 7. 頁面實作 (4 tasks)
- [ ] app/(dashboard)/foods/page.tsx - 食物資料庫主頁
- [ ] app/(dashboard)/foods/[id]/page.tsx - 食物詳情頁
- [ ] app/(dashboard)/foods/custom/page.tsx - 我的自訂食物
- [ ] app/(dashboard)/foods/favorites/page.tsx - 收藏食物

## 8. 工具函數 (5 tasks)
- [ ] lib/utils/nutrition-calculator.ts - 營養素計算
- [ ] lib/utils/unit-converter.ts - 單位轉換 (克、毫升、份)
- [ ] lib/utils/barcode-parser.ts - 條碼解析
- [ ] lib/validations/food.ts - 食物資料驗證 (Zod)
- [ ] lib/utils/food-import.ts - 批次匯入食物資料

## 9. 條碼掃描 (3 tasks)
- [ ] 安裝 @zxing/library (barcode scanner)
- [ ] 實作相機條碼掃描 UI
- [ ] 整合條碼查詢 API

## 10. 資料同步與快取 (4 tasks)
- [ ] 實作 Redis 快取熱門搜尋結果
- [ ] 建立定期同步第三方資料 Cron Job
- [ ] 建立搜尋日誌記錄
- [ ] 優化資料庫索引

## 11. 測試 (8 tasks)
- [ ] API: 食物搜尋測試 (各種條件)
- [ ] API: CRUD 操作測試
- [ ] API: 第三方 API 整合測試
- [ ] 搜尋: 模糊搜尋準確度測試
- [ ] 搜尋: Autocomplete 效能測試
- [ ] UI: 條碼掃描測試
- [ ] 資料: 營養素計算正確性測試
- [ ] 資料: 單位轉換測試

---

**總任務數**: 65
**預估時間**: 3-4 天
**依賴**: implement-meal-records
