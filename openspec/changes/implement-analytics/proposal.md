# 變更提案: 實作數據分析與報表

## 📋 變更資訊
- **變更名稱**: implement-analytics
- **建立日期**: 2025-10-25
- **預估時間**: 3-4 天
- **優先級**: High
- **依賴**: implement-nutrition-tracking

## 🎯 為什麼要做這個變更?

使用者需要視覺化的數據分析來了解自己的飲食習慣、營養攝取趨勢、運動效果等,從而做出更好的健康決策。

## 📦 主要功能

### 1. 營養趨勢分析
- 週/月卡路里攝取趨勢圖
- 三大營養素比例圖 (蛋白質/碳水/脂肪)
- 水分攝取趨勢
- 運動消耗趨勢

### 2. 進度報表
- 體重變化曲線
- 目標達成率
- 連續打卡天數
- 每週平均攝取 vs 目標

### 3. 成就系統
- 徽章獎勵 (連續記錄 7/30/100 天)
- 里程碑 (減重達成、目標達成)
- 成就牆展示

### 4. 智能建議
- 基於歷史數據的飲食建議
- 營養素不足提醒
- 運動建議

### 5. 匯出報表
- PDF 週報/月報
- CSV 數據匯出
- 圖片分享功能

## 技術方案
- **圖表庫**: recharts + chart.js
- **PDF 生成**: @react-pdf/renderer
- **數據處理**: date-fns + lodash
- **圖片匯出**: html2canvas

## 資料庫 Schema
```prisma
model Achievement {
  id          String   @id @default(cuid())
  userId      String
  type        String   // STREAK_7, STREAK_30, WEIGHT_GOAL, etc.
  title       String
  description String
  icon        String
  earnedAt    DateTime @default(now())
  user        User @relation(fields: [userId], references: [id])
}

model DailyStats {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime @unique
  totalCalories     Float
  totalProtein      Float
  totalCarbs        Float
  totalFat          Float
  totalWater        Int
  totalExercise     Int
  weight            Float?
  goalMet           Boolean  @default(false)
  user              User @relation(fields: [userId], references: [id])
  createdAt         DateTime @default(now())
}
```

## ✅ 成功標準
- [ ] 圖表可以正確顯示各類數據
- [ ] 成就系統可以自動解鎖
- [ ] PDF 報表格式美觀且資訊完整
- [ ] 資料計算準確無誤
- [ ] 響應式設計在各裝置正常運作
