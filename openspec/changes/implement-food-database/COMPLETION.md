# Phase 8: 食物資料庫系統 - 實作總結 (Part 1)

## 完成時間
2025年10月28日

## 實作概覽
成功實作食物資料庫核心功能，包含食物搜尋、分類管理、自訂食物新增、收藏功能，並整合至餐次記錄系統。使用者可以透過搜尋找到需要的食物，或新增自己的食物資料，快速記錄每日飲食。

## 技術架構

### 1. 資料庫模型 (Prisma Schema)

#### FoodCategory (食物分類)
```prisma
model FoodCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  nameEn      String?
  icon        String?
  description String?
  parentId    String?
  order       Int      @default(0)
  foods       Food[]
  parent      FoodCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    FoodCategory[] @relation("CategoryHierarchy")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("food_categories")
}
```

#### Food (食物)
```prisma
model Food {
  id           String    @id @default(cuid())
  name         String
  nameEn       String?
  description  String?
  calories     Float
  protein      Float
  carbs        Float
  fat          Float
  fiber        Float?
  sugar        Float?
  sodium       Float?
  servingSize  Float?
  servingUnit  String?
  categoryId   String
  brandId      String?
  source       FoodSource @default(SYSTEM)
  isVerified   Boolean    @default(false)
  userId       String?
  searchCount  Int        @default(0)
  useCount     Int        @default(0)
  
  category     FoodCategory         @relation(fields: [categoryId], references: [id])
  brand        Brand?               @relation(fields: [brandId], references: [id])
  user         User?                @relation(fields: [userId], references: [id])
  favorites    UserFavoriteFood[]
  
  @@index([categoryId, source])
  @@index([userId])
  @@map("foods")
}

enum FoodSource {
  SYSTEM  // 系統內建
  USER    // 使用者自訂
  API     // 第三方 API
}
```

#### Brand (品牌)
```prisma
model Brand {
  id          String   @id @default(cuid())
  name        String   @unique
  nameEn      String?
  country     String?
  website     String?
  logo        String?
  foods       Food[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("brands")
}
```

#### UserFavoriteFood (收藏食物)
```prisma
model UserFavoriteFood {
  id        String   @id @default(cuid())
  userId    String
  foodId    String
  useCount  Int      @default(1)
  lastUsed  DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  food      Food     @relation(fields: [foodId], references: [id], onDelete: Cascade)
  
  @@unique([userId, foodId])
  @@index([userId, lastUsed])
  @@map("user_favorite_foods")
}
```

### 2. 種子資料 (Seed Data)

#### 食物分類 (12 個)
- 🥬 蔬菜類 (Vegetables)
- 🍎 水果類 (Fruits)
- 🍚 穀物類 (Grains)
- 🥩 肉類 (Meat)
- 🐟 海鮮類 (Seafood)
- 🥚 蛋奶類 (Dairy & Eggs)
- 🥜 豆類與堅果 (Legumes & Nuts)
- 🥤 飲料類 (Beverages)
- 🍰 點心零食類 (Snacks & Desserts)
- 🍜 加工食品 (Processed Foods)
- 🥗 沙拉與配菜 (Salads & Sides)
- 🍛 調味料與醬料 (Condiments & Sauces)

#### 食物資料 (33 項)
涵蓋台灣常見食物:
- 肉類: 雞胸肉、豬里肌、牛腱肉、雞腿肉
- 蔬菜: 青江菜、高麗菜、菠菜、花椰菜
- 穀物: 白飯、糙米飯、全麥麵包、燕麥
- 水果: 香蕉、蘋果、芭樂、木瓜
- 海鮮: 鮭魚、鯖魚、蝦仁、花枝
- 蛋奶: 雞蛋、牛奶、無糖豆漿、希臘優格
- 其他: 豆腐、毛豆、地瓜、馬鈴薯等

使用直接 SQL 插入:
```sql
-- 分類插入
INSERT INTO food_categories (name, "nameEn", icon, "order")
VALUES ('蔬菜類', 'Vegetables', '🥬', 1);

-- 食物插入 (使用 CTE)
WITH category AS (SELECT id FROM food_categories WHERE name = '肉類')
INSERT INTO foods (name, calories, protein, carbs, fat, ...)
SELECT '雞胸肉', 165, 31, 0, 3.6, ... FROM category;
```

### 3. API 端點實作

#### GET /api/foods/search
**功能**: 搜尋食物，支援多重篩選與分頁

**查詢參數**:
- `q`: 關鍵字 (搜尋 name 或 nameEn)
- `categoryId`: 分類 ID
- `source`: 來源篩選 (SYSTEM/USER/API)
- `page`: 頁碼 (預設 1)
- `limit`: 每頁數量 (預設 20)

**回應**:
```typescript
{
  foods: Food[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**特色功能**:
- 模糊搜尋 (case-insensitive)
- 權限過濾 (USER 食物僅顯示自己的)
- 自動累計搜尋次數
- 依熱門度排序

#### GET /api/foods/[id]
**功能**: 取得單一食物詳細資訊

**回應包含**:
- 完整食物資訊
- 分類資訊 (含圖示)
- 品牌資訊
- 建立者資訊
- 收藏次數
- 是否已收藏 (isFavorite)

**權限檢查**: USER 食物僅能查看自己的

#### POST /api/foods
**功能**: 新增自訂食物

**Zod 驗證欄位** (13 個):
```typescript
{
  name: string (1-100 字元),
  nameEn?: string (最多 100 字元),
  calories: number (≥0),
  protein: number (≥0),
  carbs: number (≥0),
  fat: number (≥0),
  fiber?: number (≥0),
  sugar?: number (≥0),
  sodium?: number (≥0),
  servingSize: number (≥0),
  servingUnit: string,
  categoryId: string,
  brandId?: string
}
```

**自動設定**:
- source: USER
- userId: 當前登入使用者
- isVerified: false

#### GET /api/foods/categories
**功能**: 取得所有食物分類

**回應**:
```typescript
{
  categories: Array<{
    id: string,
    name: string,
    nameEn?: string,
    icon?: string,
    _count: { foods: number }
  }>
}
```

**排序**: 依 order 欄位升序

#### POST /api/foods/favorites
**功能**: 新增或更新收藏食物

**Upsert 邏輯**:
```typescript
await prisma.userFavoriteFood.upsert({
  where: { userId_foodId: { userId, foodId } },
  create: { userId, foodId, useCount: 1, lastUsed: new Date() },
  update: { 
    useCount: { increment: 1 }, 
    lastUsed: new Date() 
  }
});
```

**特色**: 自動追蹤使用次數和最後使用時間

#### GET /api/foods/favorites
**功能**: 取得使用者的收藏食物清單

**排序**:
1. 使用次數 (useCount) 降序
2. 最後使用時間 (lastUsed) 降序

**回應**: 包含 favoriteInfo (useCount, lastUsed)

#### DELETE /api/foods/favorites/[id]
**功能**: 移除收藏

**權限檢查**: 僅能刪除自己的收藏

#### POST /api/meals/[id]/foods
**功能**: 手動新增食物到餐次

**請求體**:
```typescript
{
  foodId: string,
  servings: number (0.1-50),
  portion?: string
}
```

**流程**:
1. 驗證餐次所有權
2. 驗證食物存在與權限
3. 複製食物資訊到 MealFood
4. 計算營養總量 (× servings)
5. 更新食物搜尋計數
6. 自動加入/更新收藏

**自動收藏**: 每次使用食物時自動 upsert 到收藏清單

#### DELETE /api/meals/[id]/foods
**功能**: 從餐次移除食物

**查詢參數**: `mealFoodId`

**權限檢查**: 驗證餐次所有權

### 4. UI 組件實作

#### FoodSearchDialog
**位置**: `/components/meals/FoodSearchDialog.tsx`

**功能**:
- 雙分頁: 搜尋食物 / 常用食物
- 即時搜尋 (300ms debounce)
- 分類篩選 (橫向滾動)
- 食物列表顯示
- 份量選擇器 (0.5 倍數調整)
- 即時營養計算
- 選擇確認

**狀態管理** (10 個 state):
```typescript
- foods: Food[]
- favoriteFoods: Food[]
- categories: Category[]
- searchQuery: string
- selectedCategory: string
- selectedFood: Food | null
- servings: number
- activeTab: 'search' | 'favorites'
- isSearching: boolean
- isFetchingFavorites: boolean
```

**整合**: 在 Meals 頁面各餐次卡片中使用

#### Foods Page
**位置**: `/app/(dashboard)/foods/page.tsx`

**功能**:
- 搜尋欄 (即時搜尋)
- 雙重篩選器 (分類 + 來源)
- 響應式網格 (1-3 欄)
- 食物卡片顯示
- 分頁導航
- 新增自訂食物對話框
- 收藏按鈕

**搜尋與篩選**:
- 關鍵字搜尋 (300ms debounce)
- 分類下拉選單
- 來源下拉選單 (全部/系統/自訂)
- 結果計數顯示

**食物卡片資訊**:
- 分類圖示 + 名稱
- 英文名稱
- 品牌名稱
- 4 項營養資訊 (熱量、蛋白質、碳水、脂肪)
- 份量資訊
- 標籤 (分類、來源)
- 收藏按鈕

**新增自訂食物對話框**:
- 13 個輸入欄位
- 分類選擇器 (含圖示)
- 即時驗證
- 送出後自動刷新列表

### 5. Meals 頁面整合

**新增功能**:
- 每個餐次卡片新增「手動新增」按鈕
- 點擊開啟 FoodSearchDialog
- 自動建立餐次 (如果不存在)
- 成功加入後刷新資料
- 顯示成功訊息

**完整流程**:
1. 使用者點擊「手動新增」→ 開啟搜尋對話框
2. 搜尋或從常用食物選擇 → 顯示詳細資訊
3. 調整份量 → 即時計算營養
4. 確認加入 → 呼叫 API
5. 自動建立餐次 (如需要) → 新增食物
6. 更新收藏計數 → 刷新頁面資料

### 6. 工具與驗證

#### Zod 驗證 Schema
**位置**: API route 內部

**食物新增驗證**:
```typescript
const createFoodSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  servingSize: z.number().min(0),
  servingUnit: z.string(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
});
```

**餐次新增驗證**:
```typescript
const addFoodSchema = z.object({
  foodId: z.string().min(1),
  servings: z.number().min(0.1).max(50),
  portion: z.string().optional(),
});
```

#### 資料庫索引優化
```prisma
@@index([categoryId, source])  // 分類與來源組合查詢
@@index([userId])              // 使用者食物查詢
@@index([userId, lastUsed])    // 收藏排序
```

## 成果展示

### 資料統計
- ✅ 12 個食物分類
- ✅ 33 種系統食物
- ✅ 支援無限自訂食物
- ✅ 6 個核心 API 端點
- ✅ 2 個完整頁面
- ✅ 10+ 個 UI 組件

### 核心功能
- ✅ 多條件食物搜尋
- ✅ 分類與來源篩選
- ✅ 自訂食物新增
- ✅ 收藏與常用追蹤
- ✅ 餐次快速新增
- ✅ 份量調整與計算
- ✅ 權限控制 (USER 食物)
- ✅ 分頁導航

### 使用者體驗
- ✅ 300ms 搜尋防抖
- ✅ 即時營養計算
- ✅ 響應式設計
- ✅ 雙分頁切換 (搜尋/常用)
- ✅ 橫向分類滾動
- ✅ 載入狀態顯示
- ✅ 錯誤處理與提示

## 技術亮點

### 1. 權限設計
- SYSTEM 食物: 所有人可見
- USER 食物: 僅建立者可見
- API 食物: 所有人可見 (未來擴充)

### 2. 收藏機制
- Upsert 模式避免重複
- 自動追蹤使用頻率
- 最後使用時間記錄
- 智慧排序 (頻率 + 時間)

### 3. 搜尋優化
- 模糊比對 (contains)
- 不區分大小寫
- 雙語言搜尋 (中英)
- 搜尋計數統計
- 熱門度排序

### 4. 資料完整性
- Foreign key constraints
- Cascade delete
- Unique constraints
- Index optimization

### 5. 類型安全
- Prisma 自動生成類型
- Zod runtime 驗證
- TypeScript 嚴格模式
- API 回應類型定義

## 未來擴充方向

### Phase 8.5-8.8 (待開發)
- [ ] 第三方 API 整合 (USDA, Open Food Facts)
- [ ] 條碼掃描功能
- [ ] 食物詳情頁面
- [ ] 我的自訂食物管理
- [ ] 品牌管理功能
- [ ] 搜尋建議 (autocomplete)
- [ ] Redis 快取優化
- [ ] 批次匯入工具
- [ ] 營養標籤元件
- [ ] 單位轉換系統

## 學習要點

### 1. Prisma 最佳實踐
- 使用 CTE 進行複雜插入
- 善用 include 減少查詢
- 索引設計考量查詢模式
- Enum 類型的資料庫對應

### 2. Next.js App Router
- Server Actions 整合
- Dynamic routes 參數處理
- API routes 錯誤處理
- Client/Server 組件分離

### 3. UI/UX 設計
- Debounce 搜尋優化
- 載入狀態管理
- 錯誤邊界處理
- 響應式布局

### 4. 資料庫設計
- 正規化與反正規化平衡
- 搜尋欄位冗餘設計
- 統計欄位維護
- 軟刪除考量

## 總結

Phase 8 (Part 1) 成功建立了完整的食物資料庫核心系統，從資料庫設計、API 開發到 UI 實作一應俱全。系統已經可以支援:

1. **食物瀏覽**: 使用者可以搜尋、篩選、瀏覽所有可用食物
2. **自訂食物**: 使用者可以新增個人化的食物資料
3. **收藏管理**: 自動追蹤常用食物，提升記錄效率
4. **餐次整合**: 無縫整合至現有的餐次記錄系統

系統設計考量了擴充性、效能和使用者體驗，為後續的第三方 API 整合、條碼掃描等進階功能打下堅實基礎。

---

**完成日期**: 2025-10-28  
**主要開發者**: AI Assistant  
**測試狀態**: ✅ 手動測試通過  
**部署狀態**: 🚀 開發環境運行中
