# 變更提案: 實作食物資料庫

## 📋 變更資訊
- **變更名稱**: implement-food-database
- **建立日期**: 2025-10-25
- **預估時間**: 3-4 天
- **優先級**: High
- **依賴**: implement-meal-records

## 🎯 為什麼要做這個變更?

除了 AI 識別食物外,使用者也需要手動搜尋和新增食物。建立完整的食物資料庫可以提供:
- 快速搜尋常見食物
- 精確的營養資訊
- 品牌食物資料
- 自訂食物保存

## 📦 主要功能

### 1. 食物搜尋
- 全文搜尋 (中英文)
- 分類篩選
- 品牌篩選
- 最近使用食物
- 收藏食物

### 2. 食物資料管理
- 營養素完整資訊 (卡路里、蛋白質、碳水、脂肪、纖維、糖)
- 份量單位 (克、毫升、份、個)
- 食物圖片
- 條碼掃描 (barcode)

### 3. 分類系統
- 主分類 (蔬菜、水果、肉類、澱粉等)
- 子分類 (綠葉蔬菜、根莖類等)
- 標籤系統 (高蛋白、低脂、素食等)

### 4. 自訂食物
- 使用者可新增自己的食物
- 可分享給其他使用者
- 管理員審核機制

### 5. 第三方資料整合
- USDA FoodData Central API
- 台灣食品營養成分資料庫
- 品牌食物資料 (7-11、全家等)

## 資料庫 Schema
```prisma
model FoodCategory {
  id          String @id @default(cuid())
  name        String
  nameEn      String?
  parentId    String?
  icon        String?
  parent      FoodCategory? @relation("CategoryTree", fields: [parentId], references: [id])
  children    FoodCategory[] @relation("CategoryTree")
  foods       Food[]
  createdAt   DateTime @default(now())
}

model Food {
  id              String   @id @default(cuid())
  name            String
  nameEn          String?
  categoryId      String
  brandId         String?
  barcode         String?  @unique
  servingSize     Float    // 預設份量 (克)
  servingUnit     String   @default("g")
  calories        Float
  protein         Float
  carbs           Float
  fat             Float
  fiber           Float?
  sugar           Float?
  sodium          Float?
  imageUrl        String?
  isCustom        Boolean  @default(false)
  isVerified      Boolean  @default(false)
  createdById     String?
  source          String?  // USDA, TAIWAN, CUSTOM
  category        FoodCategory @relation(fields: [categoryId], references: [id])
  brand           Brand? @relation(fields: [brandId], references: [id])
  createdBy       User? @relation(fields: [createdById], references: [id])
  favorites       FoodFavorite[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([name])
  @@index([barcode])
}

model Brand {
  id        String   @id @default(cuid())
  name      String   @unique
  nameEn    String?
  logoUrl   String?
  foods     Food[]
  createdAt DateTime @default(now())
}

model FoodFavorite {
  id        String   @id @default(cuid())
  userId    String
  foodId    String
  user      User @relation(fields: [userId], references: [id])
  food      Food @relation(fields: [foodId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, foodId])
}
```

## API 整合
- **USDA FoodData Central**: https://fdc.nal.usda.gov/api-guide.html
- **台灣食品營養成分資料庫**: https://consumer.fda.gov.tw/Food/TFND.aspx
- **Open Food Facts**: https://world.openfoodfacts.org/data

## ✅ 成功標準
- [ ] 搜尋響應時間 < 200ms
- [ ] 資料庫包含至少 1000+ 常見食物
- [ ] 支援條碼掃描
- [ ] 使用者可新增自訂食物
- [ ] 營養資訊準確度 > 95%
