# 變更提案: 實作飲食記錄管理

## 📋 變更資訊
- **變更名稱**: implement-meal-records
- **建立日期**: 2025-10-25
- **預估時間**: 2-3 天
- **優先級**: High
- **依賴**: implement-food-recognition

## 🎯 為什麼要做這個變更?

完整的飲食記錄系統是卡路里追蹤的核心,使用者需要查看每日、每週的飲食狀況,手動新增食物,編輯記錄,並查看營養統計。

## 📦 主要功能

### 1. 每日飲食記錄頁面
- 依時段顯示 (早餐/午餐/晚餐/點心)
- 每餐的食物清單
- 營養摘要卡片
- 進度環形圖

### 2. 手動新增食物
- 搜尋食物資料庫
- 手動輸入營養資訊
- 從常用食物選擇
- 從最近記錄快速新增

### 3. 編輯與刪除記錄
- 修改份量
- 更換食物
- 刪除單項/整餐
- 移動到其他時段

### 4. 每日營養儀表板
- 卡路里進度條
- 蛋白質/碳水/脂肪比例
- 水分攝取記錄
- 運動消耗記錄

### 5. 常用食物管理
- 收藏常吃食物
- 建立自訂食物
- 食物組合 (如常吃的早餐組合)

## 資料庫 Schema
```prisma
model MealRecord {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime // 用餐日期
  mealType    MealType // 早/午/晚/點心
  
  foods       FoodEntry[]
  notes       String?
  
  totalCalories Float
  totalProtein  Float
  totalCarbs    Float
  totalFat      Float
  
  user        User @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId, date])
}

model FoodEntry {
  id            String @id @default(cuid())
  mealRecordId  String
  
  foodName      String
  portion       String
  portionSize   Float
  
  calories      Float
  protein       Float
  carbs         Float
  fat           Float
  
  mealRecord    MealRecord @relation(fields: [mealRecordId], references: [id])
  createdAt     DateTime @default(now())
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}
```

## ✅ 成功標準
- [ ] 使用者可以查看每日飲食記錄
- [ ] 可以手動新增/編輯/刪除食物
- [ ] 營養統計即時更新
- [ ] 支援日期切換
- [ ] 常用食物功能正常
