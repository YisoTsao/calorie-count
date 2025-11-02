# Phase 9: Analytics & Achievements - 完成報告

**階段名稱**: 數據分析與成就系統  
**完成日期**: 2025-10-28  
**開發時數**: ~3 小時  
**狀態**: ✅ 已完成

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [資料庫架構](#資料庫架構)
3. [API 端點](#api-端點)
4. [UI 元件](#ui-元件)
5. [技術亮點](#技術亮點)
6. [使用統計](#使用統計)
7. [學習與收穫](#學習與收穫)

---

## 📖 專案概述

Phase 9 實現了完整的數據分析與成就系統,讓使用者可以:

### 核心功能
1. **每日統計自動計算** - 匯總所有營養、運動、體重數據
2. **趨勢圖表視覺化** - 卡路里、營養素、飲水、運動、體重趨勢
3. **成就系統** - 10 種成就類型,自動解鎖與展示
4. **智能建議** - 基於數據的個人化健康建議

### 設計理念
- **自動化計算**: 每日統計自動匯總,無需手動操作
- **視覺化呈現**: Recharts 圖表,清晰直觀
- **遊戲化激勵**: 成就系統增加使用動機
- **個人化建議**: 基於真實數據的健康提示

---

## 🗄️ 資料庫架構

### 1. DailyStats (每日統計)

```prisma
model DailyStats {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime @unique @db.Date
  
  // 飲食統計
  totalCalories     Float    @default(0)
  totalProtein      Float    @default(0)
  totalCarbs        Float    @default(0)
  totalFat          Float    @default(0)
  mealCount         Int      @default(0)
  
  // 水分統計
  totalWater        Int      @default(0) // 毫升
  waterCount        Int      @default(0) // 記錄次數
  
  // 運動統計
  totalExercise     Int      @default(0) // 運動時長 (分鐘)
  totalExerciseCalories Float @default(0)
  exerciseCount     Int      @default(0)
  
  // 體重
  weight            Float?
  bmi               Float?
  
  // 目標達成
  calorieGoalMet    Boolean  @default(false)
  proteinGoalMet    Boolean  @default(false)
  waterGoalMet      Boolean  @default(false)
  exerciseGoalMet   Boolean  @default(false)
  allGoalsMet       Boolean  @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, date])
  @@map("daily_stats")
}
```

**特點**:
- **Unique Date**: 每日一筆記錄
- **完整統計**: 涵蓋飲食、運動、水分、體重
- **目標判定**: 自動判定各項目標是否達成
- **Upsert 模式**: 更新時自動覆蓋

**統計指標**:
- 飲食: 總卡路里、三大營養素、用餐次數
- 水分: 總飲水量、記錄次數
- 運動: 總時長、總消耗、運動次數
- 體重: 當日體重、BMI
- 目標: 5 項目標達成狀態

---

### 2. Achievement (成就)

```prisma
enum AchievementType {
  STREAK_7          // 連續記錄 7 天
  STREAK_30         // 連續記錄 30 天
  STREAK_100        // 連續記錄 100 天
  WEIGHT_GOAL       // 達成體重目標
  CALORIE_GOAL_WEEK // 一週達成卡路里目標
  CALORIE_GOAL_MONTH // 一個月達成卡路里目標
  WATER_CHAMPION    // 連續一週達成飲水目標
  EXERCISE_WARRIOR  // 連續一週運動
  FIRST_MEAL        // 記錄第一餐
  FIRST_WEEK        // 完成第一週
}

model Achievement {
  id          String          @id @default(cuid())
  userId      String
  type        AchievementType
  title       String
  description String
  icon        String // emoji
  earnedAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type]) // 每個使用者每種成就只能獲得一次
  @@index([userId])
  @@map("achievements")
}
```

**成就列表**:

| 成就類型 | 標題 | 描述 | 圖示 | 解鎖條件 |
|---------|------|------|------|---------|
| FIRST_MEAL | 起步 | 記錄了第一餐飲食 | 🍽️ | 第 1 筆飲食記錄 |
| FIRST_WEEK | 一週達成 | 堅持記錄一週 | 📅 | 累計 7 天記錄 |
| STREAK_7 | 新手上路 | 連續記錄 7 天飲食 | 🔥 | 連續 7 天打卡 |
| STREAK_30 | 習慣養成 | 連續記錄 30 天飲食 | 💪 | 連續 30 天打卡 |
| STREAK_100 | 毅力大師 | 連續記錄 100 天飲食 | 🏆 | 連續 100 天打卡 |
| CALORIE_GOAL_WEEK | 卡路里達人 | 連續一週達成卡路里目標 | 🎯 | 連續 7 天達成 |
| WATER_CHAMPION | 補水達人 | 連續一週達成飲水目標 | 💧 | 連續 7 天飲水達標 |
| EXERCISE_WARRIOR | 運動健將 | 連續一週堅持運動 | 🏃 | 連續 7 天運動 ≥30 分 |

**Unique 約束**: 每個使用者每種成就只能獲得一次

---

## 🔌 API 端點

### 1. Stats API (`/api/stats`)

#### POST - 計算每日統計
```typescript
// Request
{
  "date": "2025-10-28"  // YYYY-MM-DD
}

// Response
{
  "success": true,
  "stats": {
    "id": "clxxx",
    "date": "2025-10-28",
    "totalCalories": 1850,
    "totalProtein": 85,
    "totalCarbs": 220,
    "totalFat": 60,
    "mealCount": 3,
    "totalWater": 2000,
    "waterCount": 8,
    "totalExercise": 45,
    "totalExerciseCalories": 315,
    "exerciseCount": 1,
    "weight": 70.5,
    "bmi": 22.8,
    "calorieGoalMet": true,
    "proteinGoalMet": true,
    "waterGoalMet": true,
    "exerciseGoalMet": true,
    "allGoalsMet": true
  }
}
```

**計算流程**:
1. 查詢當日所有飲食記錄 (Meal + MealFood)
2. 計算總營養素 (考慮份數)
3. 查詢當日飲水記錄
4. 查詢當日運動記錄
5. 查詢當日體重
6. 查詢使用者目標
7. 判定目標達成 (±10% 容錯)
8. Upsert 到 DailyStats
9. 檢查並授予成就

**目標判定邏輯**:
```typescript
// 卡路里: ±10% 範圍內視為達成
const calorieGoalMet = Math.abs(totalCalories - goal) <= goal * 0.1;

// 蛋白質: 達到或超過目標
const proteinGoalMet = totalProtein >= proteinGoal;

// 飲水: 達到或超過目標
const waterGoalMet = totalWater >= waterGoal;

// 運動: 至少 30 分鐘
const exerciseGoalMet = totalExercise >= 30;

// 全部達成
const allGoalsMet = calorie && protein && water && exercise;
```

#### GET - 查詢統計資料
```typescript
// Query: /api/stats?days=30

// Response
{
  "stats": [
    {
      "date": "2025-10-28",
      "totalCalories": 1850,
      "totalProtein": 85,
      // ...
    }
  ],
  "summary": {
    "totalDays": 30,
    "avgCalories": 1950,
    "avgProtein": 82,
    "avgCarbs": 225,
    "avgFat": 62,
    "avgWater": 1850,
    "avgExercise": 35,
    "avgExerciseCalories": 280,
    "goalsMetDays": 22,
    "calorieGoalMetDays": 25,
    "waterGoalMetDays": 18,
    "exerciseGoalMetDays": 20,
    "streak": 15  // 連續打卡天數
  }
}
```

**參數選項**:
- `days`: 查詢最近 N 天 (預設 7)
- `startDate` + `endDate`: 自訂日期範圍

**連續打卡計算**:
```typescript
function calculateCurrentStreak(stats): number {
  let streak = 0;
  const today = new Date();
  
  // 從今天往前算
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const found = stats.find(s => s.date === checkDate);
    
    if (found && found.mealCount > 0) {
      streak++;
    } else {
      break; // 中斷
    }
  }
  
  return streak;
}
```

---

### 2. Achievements API (`/api/achievements`)

#### GET - 查詢使用者成就
```typescript
// Request: GET /api/achievements

// Response
{
  "achievements": [
    {
      "id": "clxxx",
      "type": "STREAK_7",
      "title": "新手上路",
      "description": "連續記錄 7 天飲食",
      "icon": "🔥",
      "earnedAt": "2025-10-28T10:00:00Z"
    },
    {
      "id": "clyyy",
      "type": "WATER_CHAMPION",
      "title": "補水達人",
      "description": "連續一週達成飲水目標",
      "icon": "💧",
      "earnedAt": "2025-10-27T15:30:00Z"
    }
  ],
  "count": 2
}
```

**成就自動授予**:
- 在 `POST /api/stats` 時自動檢查
- 符合條件則自動建立成就記錄
- Unique 約束防止重複授予

**檢查邏輯示例**:
```typescript
// 連續 7 天
if (streak >= 7 && !existingTypes.has('STREAK_7')) {
  newAchievements.push({
    userId,
    type: 'STREAK_7',
    title: '新手上路',
    description: '連續記錄 7 天飲食',
    icon: '🔥'
  });
}

// 一週飲水目標
const lastWeekWaterGoalMet = stats.slice(0, 7)
  .filter(s => s.waterGoalMet).length;
  
if (lastWeekWaterGoalMet >= 7 && !existingTypes.has('WATER_CHAMPION')) {
  // 授予成就
}
```

---

## 🎨 UI 元件

### 1. TrendChart (趨勢圖表元件)

**檔案**: `/components/analytics/TrendChart.tsx` (150 行)

**功能特點**:
- ✅ 5 種圖表類型 (卡路里/營養素/水分/運動/體重)
- ✅ Recharts 整合
- ✅ 響應式設計
- ✅ 自訂樣式與配色

**Props**:
```typescript
interface TrendChartProps {
  data: Array<{
    date: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    water?: number;
    exercise?: number;
    weight?: number;
  }>;
  type: 'calories' | 'nutrients' | 'water' | 'exercise' | 'weight';
  title: string;
}
```

**圖表類型**:

1. **Calories (面積圖)**:
```tsx
<AreaChart data={chartData}>
  <Area 
    type="monotone" 
    dataKey="calories" 
    stroke="#3b82f6"
    fill="url(#colorCalories)" // 漸層
  />
</AreaChart>
```

2. **Nutrients (折線圖)**:
```tsx
<LineChart data={chartData}>
  <Line dataKey="protein" stroke="#ef4444" name="蛋白質" />
  <Line dataKey="carbs" stroke="#f59e0b" name="碳水" />
  <Line dataKey="fat" stroke="#10b981" name="脂肪" />
</LineChart>
```

3. **Water/Exercise (柱狀圖)**:
```tsx
<BarChart data={chartData}>
  <Bar 
    dataKey="water" 
    fill="#3b82f6" 
    radius={[8, 8, 0, 0]} // 圓角
  />
</BarChart>
```

4. **Weight (折線圖)**:
```tsx
<LineChart data={chartData}>
  <Line 
    dataKey="weight" 
    stroke="#9333ea"
    strokeWidth={3}
    dot={{ fill: '#9333ea', r: 4 }}
  />
</LineChart>
```

**自訂配置**:
- 日期格式: `MM/DD`
- Y 軸範圍: `dataMin - 2` 到 `dataMax + 2`
- Tooltip 樣式: 白底、灰邊框、圓角
- Grid: 虛線 `3 3`

---

### 2. AchievementWall (成就牆)

**檔案**: `/components/analytics/AchievementWall.tsx` (140 行)

**功能特點**:
- ✅ 網格展示已獲得成就
- ✅ 動態配色 (依成就類型)
- ✅ Hover 動畫 (放大 + 陰影)
- ✅ 可獲得成就預覽

**成就卡片配色**:
```typescript
const ACHIEVEMENT_COLORS = {
  STREAK_7: 'bg-orange-100 text-orange-700',
  STREAK_30: 'bg-red-100 text-red-700',
  STREAK_100: 'bg-purple-100 text-purple-700',
  WEIGHT_GOAL: 'bg-green-100 text-green-700',
  CALORIE_GOAL_WEEK: 'bg-blue-100 text-blue-700',
  WATER_CHAMPION: 'bg-cyan-100 text-cyan-700',
  EXERCISE_WARRIOR: 'bg-amber-100 text-amber-700',
  FIRST_MEAL: 'bg-gray-100 text-gray-700',
  FIRST_WEEK: 'bg-pink-100 text-pink-700',
};
```

**UI 結構**:
```
┌─────────────────────────────────────┐
│ 🏆 成就牆         3 個成就          │
├─────────────────────────────────────┤
│ [🔥 新手上路]  [💪 習慣養成]       │
│ 連續記錄 7 天  連續記錄 30 天      │
│ 2025-10-21     2025-10-28          │
│                                     │
│ [💧 補水達人]                      │
│ 連續一週達成飲水目標                │
│ 2025-10-27                         │
├─────────────────────────────────────┤
│ 🎯 可獲得成就                       │
│ [🏆 毅力大師]  [🎯 卡路里達人]     │
│ 連續記錄 100天 連續一週達成目標    │
└─────────────────────────────────────┘
```

**Hover 效果**:
```tsx
<div className="hover:scale-105 hover:shadow-lg transition-all duration-200">
  {/* 成就卡片 */}
</div>
```

---

### 3. Analytics Page (數據分析頁面)

**檔案**: `/app/analytics/page.tsx` (280 行)

**頁面結構**:
```
┌───────────────────────────────────────┐
│ 數據分析        [7天][30天][90天]    │
│ 追蹤您的健康趨勢與成就                │
├───────────────────────────────────────┤
│ [平均卡路里] [目標達成率] [連續打卡] │
│   1950 kcal     73%        15 天     │
├───────────────────────────────────────┤
│ 📊 卡路里攝取趨勢                     │
│ [面積圖 - 30 天]                      │
├───────────────────────────────────────┤
│ [🥗 三大營養素] [⚖️ 體重變化]        │
│ [折線圖]        [折線圖]              │
├───────────────────────────────────────┤
│ [💧 飲水量]     [🏃 運動時長]         │
│ [柱狀圖]        [柱狀圖]              │
├───────────────────────────────────────┤
│ 🏆 成就牆                             │
│ [已獲得成就網格]                      │
├───────────────────────────────────────┤
│ 💡 健康建議                           │
│ • 飲水量不足                          │
│ • 運動量偏低                          │
│ • 堅持打卡 15 天,繼續保持!           │
└───────────────────────────────────────┘
```

**摘要卡片**:
```tsx
const summary = {
  avgCalories: 1950,
  goalSuccessRate: 73%, // goalsMetDays / totalDays
  streak: 15,
  totalDays: 30
};
```

**Period Selector**:
```tsx
<div className="flex gap-2 bg-gray-100 rounded-lg p-1">
  <button 
    className={period === '7' ? 'bg-white shadow' : ''}
    onClick={() => setPeriod('7')}
  >
    7 天
  </button>
  {/* 30 天、90 天 */}
</div>
```

**智能建議邏輯**:
```typescript
// 卡路里偏高
if (avgCalories > 2500) {
  suggestions.push({
    icon: '📉',
    title: '卡路里攝取偏高',
    desc: `平均每日 ${avgCalories} 卡,建議控制...`
  });
}

// 飲水不足
if (avgWater < 1500) {
  suggestions.push({
    icon: '💧',
    title: '飲水量不足',
    desc: `平均每日 ${avgWater}ml,建議增加至 2000ml`
  });
}

// 運動不足
if (avgExercise < 30) {
  suggestions.push({
    icon: '🏃',
    title: '運動量不足',
    desc: `平均每日 ${avgExercise} 分鐘,建議增加至 30 分鐘`
  });
}

// 堅持打卡
if (streak >= 7) {
  suggestions.push({
    icon: '🔥',
    title: '堅持打卡',
    desc: `已連續記錄 ${streak} 天,繼續保持!`
  });
}

// 目標達成優秀
if (goalSuccessRate >= 80) {
  suggestions.push({
    icon: '🎯',
    title: '目標達成優秀',
    desc: `目標達成率 ${goalSuccessRate}%,表現很好!`
  });
}
```

---

## 🎯 技術亮點

### 1. 自動化統計計算

**Upsert 模式**:
```typescript
await prisma.dailyStats.upsert({
  where: { date: statsDate },
  create: {
    userId,
    date: statsDate,
    totalCalories,
    totalProtein,
    // ...
  },
  update: {
    totalCalories,
    totalProtein,
    // ...
  }
});
```

**優點**:
- 避免重複記錄
- 支援即時更新
- 簡化邏輯

**飲食營養計算**:
```typescript
const meals = await prisma.meal.findMany({
  where: { userId, mealDate: statsDate },
  include: { foods: true }
});

meals.forEach(meal => {
  meal.foods.forEach(mealFood => {
    const multiplier = mealFood.servings;
    totalCalories += mealFood.calories * multiplier;
    totalProtein += mealFood.protein * multiplier;
    totalCarbs += mealFood.carbs * multiplier;
    totalFat += mealFood.fat * multiplier;
  });
});
```

---

### 2. 成就自動授予

**批次檢查**:
```typescript
async function checkAndAwardAchievements(userId: string) {
  // 1. 查詢所有統計
  const stats = await prisma.dailyStats.findMany({ ... });
  
  // 2. 查詢已有成就
  const existing = await prisma.achievement.findMany({ ... });
  const existingTypes = new Set(existing.map(a => a.type));
  
  // 3. 檢查各種成就條件
  const newAchievements = [];
  
  if (streak >= 7 && !existingTypes.has('STREAK_7')) {
    newAchievements.push({ ... });
  }
  
  // 4. 批次建立
  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({
      data: newAchievements
    });
  }
  
  return newAchievements;
}
```

**檢查時機**: 每次計算 DailyStats 時自動執行

---

### 3. Recharts 圖表配置

**漸層填充**:
```tsx
<defs>
  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
  </linearGradient>
</defs>
<Area fill="url(#colorCalories)" />
```

**動態 Y 軸**:
```tsx
<YAxis domain={['dataMin - 2', 'dataMax + 2']} />
```

**圓角柱狀圖**:
```tsx
<Bar radius={[8, 8, 0, 0]} />
```

---

### 4. 連續打卡計算

**算法邏輯**:
```typescript
function calculateCurrentStreak(stats): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const found = stats.find(s => {
      const statDate = new Date(s.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === checkDate.getTime();
    });
    
    if (found && found.mealCount > 0) {
      streak++;
    } else {
      break; // 中斷則停止
    }
  }
  
  return streak;
}
```

**判定標準**: 當日有至少 1 筆飲食記錄

---

## 📈 使用統計

### 資料庫模型
- **新增模型**: 2 個 (DailyStats, Achievement)
- **新增 Enum**: 1 個 (AchievementType - 10 種)
- **索引**: 2 個 ([userId, date], [userId])

### API 端點
- **Stats API**: 2 個方法 (POST/GET)
- **Achievements API**: 1 個方法 (GET)
- **總端點數**: 3 個

### UI 元件
- **頁面元件**: 1 個 (AnalyticsPage)
- **功能元件**: 2 個 (TrendChart, AchievementWall)
- **圖表類型**: 5 種
- **總程式碼**: ~570 行

### 功能特性
- **統計指標**: 15 個 (卡路里、營養素、水分、運動、體重等)
- **成就類型**: 10 種
- **圖表類型**: 5 種 (面積、折線、柱狀)
- **Period 選項**: 3 個 (7/30/90 天)
- **智能建議**: 5+ 條規則

---

## 💡 學習與收穫

### 1. 資料聚合與統計

**學習重點**:
- Prisma 關聯查詢 (include)
- 複雜資料計算 (reduce、forEach)
- 日期處理與比對

**實際應用**:
```typescript
// 匯總飲食營養
meals.forEach(meal => {
  meal.foods.forEach(mealFood => {
    totalCalories += mealFood.calories * mealFood.servings;
  });
});

// 匯總運動消耗
const totalExerciseCalories = exercises.reduce(
  (sum, ex) => sum + ex.calories, 
  0
);
```

---

### 2. 成就系統設計

**設計原則**:
1. **自動化**: 無需手動觸發
2. **防重複**: Unique 約束
3. **批次處理**: createMany
4. **擴展性**: Enum 類型

**挑戰與解決**:
- **挑戰**: 如何避免重複授予?
- **解決**: `@@unique([userId, type])` + Set 檢查

```typescript
const existingTypes = new Set(existing.map(a => a.type));
if (!existingTypes.has('STREAK_7')) {
  // 授予新成就
}
```

---

### 3. Recharts 圖表庫

**優點**:
- React 原生元件
- 豐富的圖表類型
- 高度可自訂

**最佳實踐**:
```tsx
// 1. 使用 ResponsiveContainer
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>

// 2. 自訂 Tooltip 樣式
<Tooltip contentStyle={{
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px'
}} />

// 3. 漸層填充
<defs>
  <linearGradient id="colorCalories">
    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
  </linearGradient>
</defs>
```

---

### 4. 日期處理技巧

**時區處理**:
```typescript
const statsDate = new Date(date);
statsDate.setHours(0, 0, 0, 0); // 重置時間

// 查詢當日記錄
where: {
  mealDate: {
    gte: statsDate,
    lt: new Date(statsDate.getTime() + 24 * 60 * 60 * 1000)
  }
}
```

**日期比對**:
```typescript
const statDate = new Date(s.date);
statDate.setHours(0, 0, 0, 0);
return statDate.getTime() === checkDate.getTime();
```

---

### 5. 智能建議邏輯

**規則引擎**:
```typescript
const suggestions = [];

// 規則 1: 卡路里偏高
if (avgCalories > 2500) {
  suggestions.push({ ... });
}

// 規則 2: 飲水不足
if (avgWater < 1500) {
  suggestions.push({ ... });
}

// 規則 3: 運動不足
if (avgExercise < 30) {
  suggestions.push({ ... });
}

// 規則 4: 堅持打卡 (正向激勵)
if (streak >= 7) {
  suggestions.push({ ... });
}
```

**個人化建議**: 基於真實數據,而非固定文案

---

## 🎓 總結

### 已實現功能

✅ **每日統計系統**
- 自動匯總飲食、運動、水分、體重
- Upsert 模式支援即時更新
- 15+ 統計指標

✅ **趨勢圖表**
- 5 種圖表類型
- Recharts 整合
- 響應式設計

✅ **成就系統**
- 10 種成就類型
- 自動解鎖
- 成就牆展示

✅ **智能建議**
- 5+ 規則引擎
- 個人化提示
- 正向激勵

### 技術成果

- **資料庫**: 2 個新模型 + 完整統計
- **API**: 3 個端點,支援計算與查詢
- **UI**: 3 個元件,570+ 行程式碼
- **整合**: Dashboard + Analytics 專屬頁面

### 下一步建議

1. **PDF 報表匯出**: 使用 @react-pdf/renderer
2. **資料匯出**: CSV/JSON 下載
3. **進階圖表**: 圓餅圖、雷達圖
4. **社交分享**: 成就圖片生成
5. **通知提醒**: 打卡提醒、成就通知
6. **AI 分析**: 基於歷史數據的智能預測

---

**完成日期**: 2025-10-28  
**開發者**: GitHub Copilot  
**專案**: Calorie Count - Phase 9 ✅
