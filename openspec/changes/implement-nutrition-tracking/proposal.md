# 變更提案: 實作營養追蹤功能

## 📋 變更資訊
- **變更名稱**: implement-nutrition-tracking
- **建立日期**: 2025-10-25
- **預估時間**: 2 天
- **優先級**: Medium
- **依賴**: implement-meal-records

## 🎯 為什麼要做這個變更?

除了飲食記錄,使用者還需要追蹤水分攝取、運動消耗、體重變化等,形成完整的健康追蹤系統。

## 📦 主要功能

### 1. 水分攝取記錄
- 快速新增 (100ml, 200ml, 500ml 按鈕)
- 自訂容量
- 每日進度條
- 喝水提醒

### 2. 運動消耗記錄
- 運動類型選擇
- 運動時長
- 消耗卡路里計算
- 運動歷史

### 3. 體重記錄
- 每日體重輸入
- 體重趨勢圖
- 與目標體重比較
- BMI 變化追蹤

### 4. 每日摘要
- 總攝取 vs 總消耗
- 淨卡路里
- 目標達成狀況
- 連續記錄天數

## 資料庫 Schema
```prisma
model WaterIntake {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime
  amount    Int      // 毫升
  time      DateTime
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model Exercise {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  type        String
  duration    Int      // 分鐘
  calories    Float    // 消耗卡路里
  notes       String?
  user        User @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}

model WeightRecord {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @unique
  weight    Float    // 公斤
  bmi       Float?
  notes     String?
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## ✅ 成功標準
- [ ] 水分追蹤功能完整
- [ ] 運動記錄可以正確計算消耗
- [ ] 體重記錄可以顯示趨勢
- [ ] 每日摘要準確計算
