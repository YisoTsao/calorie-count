# Phase 8: 食物資料庫 - 實作計畫

## 📋 功能概述

建立完整的食物資料庫系統，讓使用者可以手動搜尋並新增常見食物到飲食記錄，補充 AI 辨識功能的不足。

---

## 🎯 核心目標

1. **手動新增食物** - 使用者可搜尋並快速新增食物
2. **常用食物收藏** - 快速存取經常吃的食物
3. **品牌食物資料** - 提供常見品牌食物資訊
4. **分類瀏覽** - 依食物類別快速找到想要的食物
5. **自訂食物** - 使用者可新增自己的食物

---

## 📊 資料庫 Schema

### 1. Food 食物表
```prisma
model Food {
  id          String   @id @default(cuid())
  name        String   // 食物名稱
  nameEn      String?  // 英文名稱
  description String?  // 描述
  
  // 營養素 (per 100g)
  calories    Float    // 卡路里 (kcal)
  protein     Float    // 蛋白質 (g)
  carbs       Float    // 碳水化合物 (g)
  fat         Float    // 脂肪 (g)
  fiber       Float?   // 膳食纖維 (g)
  sugar       Float?   // 糖 (g)
  sodium      Float?   // 鈉 (mg)
  
  // 分類與品牌
  categoryId  String?
  category    FoodCategory? @relation(fields: [categoryId], references: [id])
  brandId     String?
  brand       Brand?    @relation(fields: [brandId], references: [id])
  
  // 來源與狀態
  source      FoodSource @default(SYSTEM)  // SYSTEM, USER, API
  isVerified  Boolean    @default(false)   // 是否經過驗證
  userId      String?    // 如果是使用者自訂
  user        User?      @relation(fields: [userId], references: [id])
  
  // 使用統計
  searchCount Int        @default(0)       // 搜尋次數
  useCount    Int        @default(0)       // 使用次數
  
  // 關聯
  favorites   UserFavoriteFood[]
  mealFoods   MealFood[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@index([name])
  @@index([categoryId])
  @@index([brandId])
  @@index([source])
  @@map("foods")
}

enum FoodSource {
  SYSTEM   // 系統內建
  USER     // 使用者自訂
  API      // 第三方 API
}
```

### 2. FoodCategory 食物分類表
```prisma
model FoodCategory {
  id          String         @id @default(cuid())
  name        String         // 分類名稱
  nameEn      String?        // 英文名稱
  icon        String?        // 圖示
  description String?
  
  // 階層結構
  parentId    String?
  parent      FoodCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    FoodCategory[] @relation("CategoryHierarchy")
  
  // 排序
  order       Int            @default(0)
  
  // 關聯
  foods       Food[]
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  @@map("food_categories")
}
```

### 3. Brand 品牌表
```prisma
model Brand {
  id          String   @id @default(cuid())
  name        String   @unique
  nameEn      String?
  country     String?  // 國家
  logo        String?  // Logo URL
  website     String?
  
  foods       Food[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("brands")
}
```

### 4. UserFavoriteFood 常用食物表
```prisma
model UserFavoriteFood {
  id        String   @id @default(cuid())
  userId    String
  foodId    String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  food      Food     @relation(fields: [foodId], references: [id], onDelete: Cascade)
  
  // 使用統計
  useCount  Int      @default(0)
  lastUsed  DateTime @default(now())
  
  createdAt DateTime @default(now())
  
  @@unique([userId, foodId])
  @@index([userId])
  @@map("user_favorite_foods")
}
```

---

## 🔌 API 端點設計

### 1. 食物搜尋
```typescript
GET /api/foods/search?q=雞胸肉&category=meat&brand=&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "food_123",
      "name": "雞胸肉",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "category": { "id": "cat_1", "name": "肉類" },
      "brand": null,
      "source": "SYSTEM"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

### 2. 取得食物詳情
```typescript
GET /api/foods/[id]
```

### 3. 新增自訂食物
```typescript
POST /api/foods
Body: {
  name: "自製沙拉",
  calories: 150,
  protein: 5,
  carbs: 20,
  fat: 8
}
```

### 4. 常用食物管理
```typescript
GET /api/foods/favorites            // 查詢常用食物
POST /api/foods/favorites           // 新增到常用
DELETE /api/foods/favorites/[id]    // 移除常用
```

### 5. 分類查詢
```typescript
GET /api/foods/categories           // 所有分類
GET /api/foods/categories/[id]      // 特定分類的食物
```

### 6. 品牌查詢
```typescript
GET /api/foods/brands               // 所有品牌
GET /api/foods/brands/[id]/foods    // 特定品牌的食物
```

---

## 🎨 UI 組件設計

### 1. FoodSearchDialog 食物搜尋對話框
```tsx
<FoodSearchDialog
  onSelect={(food) => handleAddFood(food)}
  mealType="LUNCH"
/>
```

**功能**:
- 搜尋輸入框 (即時搜尋)
- 分類篩選器
- 品牌篩選器
- 搜尋結果列表
- 營養素預覽
- 份量調整器
- 加入按鈕

### 2. FoodCard 食物卡片
```tsx
<FoodCard
  food={food}
  onAdd={handleAdd}
  onFavorite={handleFavorite}
  isFavorite={false}
/>
```

**顯示**:
- 食物名稱
- 品牌 (如果有)
- 營養素摘要
- 愛心收藏按鈕
- 加入按鈕

### 3. FavoriteFoodsSection 常用食物區
```tsx
<FavoriteFoodsSection
  userId={userId}
  onSelect={handleSelect}
/>
```

**功能**:
- 快速存取常用食物
- 水平滾動卡片
- 點擊快速新增

### 4. CreateFoodForm 自訂食物表單
```tsx
<CreateFoodForm
  onSubmit={handleCreate}
  onCancel={handleCancel}
/>
```

**欄位**:
- 食物名稱 (必填)
- 卡路里 (必填)
- 蛋白質、碳水、脂肪 (必填)
- 份量 (選填)
- 描述 (選填)

---

## 📄 頁面設計

### 1. 食物搜尋頁面 (整合到 Meals 頁面)
```
/meals 頁面新增「手動新增」按鈕
  ↓
開啟 FoodSearchDialog
  ↓
搜尋/瀏覽食物
  ↓
選擇份量
  ↓
新增到當前餐點
```

### 2. 常用食物管理頁面 (可選)
```
/meals/favorites

- 顯示所有常用食物
- 編輯功能
- 快速新增到今日飲食
```

---

## 🔄 資料流程

### 搜尋食物流程
```
1. 使用者輸入關鍵字
   ↓
2. 即時搜尋 API (debounce 300ms)
   ↓
3. 顯示結果 (依相關性排序)
   ↓
4. 使用者選擇食物
   ↓
5. 調整份量
   ↓
6. 新增到 MealFood 表
```

### 常用食物流程
```
1. 使用者點擊愛心收藏
   ↓
2. POST /api/foods/favorites
   ↓
3. 加入 UserFavoriteFood 表
   ↓
4. 更新 UI (愛心填滿)
```

---

## 📦 初始資料準備

### 食物分類 (範例)
```javascript
const categories = [
  { name: "蔬菜類", icon: "🥬" },
  { name: "水果類", icon: "🍎" },
  { name: "肉類", icon: "🍖" },
  { name: "海鮮類", icon: "🐟" },
  { name: "蛋奶類", icon: "🥚" },
  { name: "五穀雜糧", icon: "🌾" },
  { name: "豆類", icon: "🫘" },
  { name: "堅果類", icon: "🥜" },
  { name: "飲料", icon: "🥤" },
  { name: "零食", icon: "🍪" },
  { name: "調味料", icon: "🧂" },
  { name: "速食", icon: "🍔" },
];
```

### 常見食物資料 (範例 50-100 種)
```javascript
const commonFoods = [
  // 肉類
  { name: "雞胸肉", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "肉類" },
  { name: "牛肉", calories: 250, protein: 26, carbs: 0, fat: 17, category: "肉類" },
  
  // 蔬菜
  { name: "花椰菜", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: "蔬菜類" },
  { name: "菠菜", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: "蔬菜類" },
  
  // 五穀
  { name: "白飯", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: "五穀雜糧" },
  { name: "全麥麵包", calories: 247, protein: 13, carbs: 41, fat: 4.2, category: "五穀雜糧" },
  
  // ... 更多
];
```

### Seed Script
```typescript
// prisma/seed.ts
async function seedFoods() {
  // 1. 建立分類
  for (const cat of categories) {
    await prisma.foodCategory.create({ data: cat });
  }
  
  // 2. 建立食物
  for (const food of commonFoods) {
    await prisma.food.create({ data: food });
  }
}
```

---

## ✅ 實作任務清單

### Phase 8.1: 資料庫與 Seed (Day 1)
- [ ] 1.1 建立 Food model
- [ ] 1.2 建立 FoodCategory model
- [ ] 1.3 建立 Brand model
- [ ] 1.4 建立 UserFavoriteFood model
- [ ] 1.5 執行 migration
- [ ] 1.6 撰寫 seed script
- [ ] 1.7 準備初始資料 (50-100 種食物)
- [ ] 1.8 執行 seed

### Phase 8.2: API 開發 (Day 2)
- [ ] 2.1 實作 GET /api/foods/search
- [ ] 2.2 實作 GET /api/foods/[id]
- [ ] 2.3 實作 POST /api/foods (自訂食物)
- [ ] 2.4 實作 GET /api/foods/favorites
- [ ] 2.5 實作 POST /api/foods/favorites
- [ ] 2.6 實作 DELETE /api/foods/favorites/[id]
- [ ] 2.7 實作 GET /api/foods/categories
- [ ] 2.8 實作 GET /api/foods/brands

### Phase 8.3: UI 組件開發 (Day 3)
- [ ] 3.1 建立 FoodSearchDialog 組件
- [ ] 3.2 建立 FoodCard 組件
- [ ] 3.3 建立 FoodSearchInput 組件
- [ ] 3.4 建立 CategoryFilter 組件
- [ ] 3.5 建立 FavoriteFoodsSection 組件
- [ ] 3.6 建立 CreateFoodForm 組件
- [ ] 3.7 建立 PortionSelector 組件

### Phase 8.4: 整合與測試 (Day 4)
- [ ] 4.1 整合 FoodSearchDialog 到 Meals 頁面
- [ ] 4.2 測試搜尋功能
- [ ] 4.3 測試新增食物到飲食記錄
- [ ] 4.4 測試常用食物收藏
- [ ] 4.5 測試自訂食物
- [ ] 4.6 測試分類篩選
- [ ] 4.7 效能優化 (搜尋 debounce)
- [ ] 4.8 UI/UX 調整

---

## 🎯 成功標準

### 功能完整性
- ✅ 使用者可搜尋食物
- ✅ 使用者可新增食物到飲食記錄
- ✅ 使用者可收藏常用食物
- ✅ 使用者可建立自訂食物
- ✅ 搜尋結果即時顯示
- ✅ 支援分類篩選

### 效能指標
- 搜尋響應時間 < 500ms
- 初始資料載入 < 1s
- 搜尋結果 debounce 300ms

### 使用者體驗
- 搜尋輸入流暢
- 結果排序合理
- 常用食物快速存取
- 營養資訊清楚顯示

---

## 📈 預期成果

完成 Phase 8 後，使用者將能夠：

1. ✅ **快速新增常見食物** - 不必每次都拍照
2. ✅ **建立常用食物清單** - 早餐常吃的燕麥、雞蛋等
3. ✅ **搜尋品牌食物** - 全聯、7-11 的包裝食品
4. ✅ **自訂食物** - 家常菜的營養資料
5. ✅ **瀏覽分類** - 快速找到想要的食物類別

**預估開發時間**: 3-4 天  
**優先度**: 🔴 高 (核心功能補充)

---

## 🚀 下一步

完成 Phase 8 後，建議進入：
- Phase 11: 部署準備與優化
- Phase 10: 進階分析功能
