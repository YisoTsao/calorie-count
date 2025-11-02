# 實作食物資料庫 - 任務清單

預估時間: 3-4 天

## 1. 資料庫 Schema (5 tasks)
- [x] 新增 FoodCategory model 到 Prisma schema
- [x] 新增 Food model 到 Prisma schema
- [x] 新增 Brand model 到 Prisma schema
- [x] 新增 UserFavoriteFood model 到 Prisma schema
- [x] 執行 migration

## 2. 資料種子 (Seed Data) (5 tasks)
- [x] 建立食物分類資料 (12 個分類)
- [x] 匯入台灣常見食物資料 (33 項)
- [ ] 匯入品牌資料 (7-11, 全家, 萊爾富等)
- [x] 建立 prisma/seed-complete.sql
- [x] 執行 seed 指令

## 3. 第三方 API 整合 (6 tasks)
- [ ] lib/integrations/usda-api.ts - USDA API client
- [ ] lib/integrations/taiwan-fda.ts - 台灣食品資料庫
- [ ] lib/integrations/openfoodfacts.ts - Open Food Facts API
- [ ] lib/integrations/barcode-scanner.ts - 條碼掃描整合
- [ ] 建立 API keys 環境變數
- [ ] 建立 API 錯誤處理與重試機制

## 4. 搜尋系統 (4 tasks)
- [x] 使用 Prisma 內建全文搜尋
- [x] 實作食物搜尋功能 (關鍵字、分類、來源)
- [x] 實作模糊搜尋 (contains, case-insensitive)
- [ ] 實作搜尋建議 (autocomplete)

## 5. API Routes (12 tasks)
### 食物 CRUD
- [x] GET /api/foods/search?q=&categoryId=&source= - 搜尋食物
- [x] GET /api/foods/[id] - 取得食物詳情
- [x] POST /api/foods - 新增自訂食物
- [ ] PATCH /api/foods/[id] - 更新自訂食物
- [ ] DELETE /api/foods/[id] - 刪除自訂食物

### 分類
- [x] GET /api/foods/categories - 取得所有分類
- [ ] GET /api/food-categories/[id]/foods - 取得分類下的食物

### 品牌
- [ ] GET /api/brands - 取得所有品牌
- [ ] GET /api/brands/[id]/foods - 取得品牌下的食物

### 收藏
- [x] POST /api/foods/favorites - 新增/更新收藏食物
- [x] DELETE /api/foods/favorites/[id] - 取消收藏
- [x] GET /api/foods/favorites - 取得收藏清單

### 餐次整合
- [x] POST /api/meals/[id]/foods - 新增食物到餐次
- [x] DELETE /api/meals/[id]/foods - 從餐次移除食物

## 6. UI 元件 (10 tasks)
- [x] FoodSearchDialog - 搜尋對話框 (含 autocomplete)
- [x] FoodCard - 食物卡片 (在 Foods 頁面)
- [ ] FoodDetailModal - 食物詳情彈窗
- [x] CategoryFilter - 分類篩選器 (橫向滾動)
- [ ] BrandFilter - 品牌篩選器
- [x] AddCustomFoodDialog - 新增自訂食物對話框
- [x] NutritionInfo - 營養資訊顯示
- [ ] BarcodeScannerButton - 條碼掃描按鈕
- [x] FavoriteFoodsSection - 收藏食物列表 (在 Dialog 中)
- [x] ServingsSelector - 份量選擇器

## 7. 頁面實作 (4 tasks)
- [x] app/(dashboard)/foods/page.tsx - 食物資料庫主頁
- [ ] app/(dashboard)/foods/[id]/page.tsx - 食物詳情頁
- [ ] app/(dashboard)/foods/custom/page.tsx - 我的自訂食物
- [ ] app/(dashboard)/foods/favorites/page.tsx - 收藏食物

## 8. 工具函數 (5 tasks)
- [x] 營養素計算 (在 API 中實作)
- [x] 單位處理 (servingSize, servingUnit)
- [ ] lib/utils/barcode-parser.ts - 條碼解析
- [x] lib/validations/food.ts - 食物資料驗證 (Zod)
- [ ] lib/utils/food-import.ts - 批次匯入食物資料

## 9. 條碼掃描 (3 tasks)
- [ ] 安裝 @zxing/library (barcode scanner)
- [ ] 實作相機條碼掃描 UI
- [ ] 整合條碼查詢 API

## 10. 資料同步與快取 (4 tasks)
- [ ] 實作 Redis 快取熱門搜尋結果
- [ ] 建立定期同步第三方資料 Cron Job
- [x] 建立搜尋計數記錄 (searchCount)
- [x] 優化資料庫索引 (Prisma schema)

## 11. 測試 (8 tasks)
- [x] API: 食物搜尋測試 (手動測試完成)
- [x] API: 新增自訂食物測試
- [ ] API: 第三方 API 整合測試
- [x] UI: 搜尋與篩選功能測試
- [x] UI: 新增食物流程測試
- [ ] UI: 條碼掃描測試
- [x] 資料: 營養素計算正確性測試
- [ ] 資料: 單位轉換測試

---

## 當前進度總結

### ✅ 已完成 (Phase 8.1-8.4)
- **資料庫設計**: 4 個模型 (Food, FoodCategory, Brand, UserFavoriteFood)
- **種子資料**: 12 分類 + 33 食物
- **核心 API**: 搜尋、詳情、新增、分類、收藏
- **餐次整合**: 手動新增食物到餐次
- **UI 組件**: FoodSearchDialog, FoodCard, 分類篩選
- **完整頁面**: /foods (食物資料庫瀏覽)

### 🔄 進行中
- 更多食物資料擴充
- 品牌資料整合

### ⏳ 待開發
- 第三方 API 整合 (USDA, Open Food Facts)
- 條碼掃描功能
- 食物詳情頁面
- 我的自訂食物管理頁面
- 搜尋建議 (autocomplete)
- Redis 快取優化

**總任務數**: 65
**預估時間**: 3-4 天
**依賴**: implement-meal-records
