# Phase 4: Nutrition Tracking - 完成報告

**階段名稱**: 營養追蹤系統  
**完成日期**: 2025-10-28  
**開發時數**: ~4 小時  
**狀態**: ✅ 已完成

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [資料庫架構](#資料庫架構)
3. [API 端點](#api-端點)
4. [UI 元件](#ui-元件)
5. [Dashboard 整合](#dashboard-整合)
6. [技術亮點](#技術亮點)
7. [使用統計](#使用統計)
8. [學習與收穫](#學習與收穫)

---

## 📖 專案概述

Phase 4 實現了完整的營養追蹤系統，包含三大核心功能：

### 核心功能
1. **飲水追蹤** - 記錄每日飲水量，追蹤水分攝取目標
2. **運動記錄** - 記錄運動類型與時間，自動計算卡路里消耗
3. **體重管理** - 追蹤體重變化，計算 BMI，顯示趨勢圖表

### 設計理念
- **即時反饋**: 所有操作立即更新 UI
- **視覺化呈現**: 進度條、圖表、統計數據
- **簡化輸入**: 快速按鈕、智能預設值
- **數據洞察**: 趨勢分析、目標達成提示

---

## 🗄️ 資料庫架構

### 1. WaterIntake (飲水記錄)

```prisma
model WaterIntake {
  id     String   @id @default(cuid())
  userId String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date   DateTime @db.Date
  amount Int      // 毫升 (ml)
  time   DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, date])
  @@map("water_intakes")
}
```

**欄位說明**:
- `amount`: 飲水量 (1-5000ml)
- `date`: 記錄日期
- `time`: 具體時間
- 索引: `[userId, date]` 加速查詢

### 2. Exercise (運動記錄)

```prisma
model Exercise {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date     DateTime @db.Date
  type     String   // 運動類型
  duration Int      // 分鐘
  calories Float    // 卡路里消耗
  time     DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, date])
  @@map("exercises")
}
```

**欄位說明**:
- `type`: 14 種運動類型 (慢跑、游泳、瑜伽等)
- `duration`: 運動時間 (分鐘)
- `calories`: 自動計算的卡路里消耗

**MET 值參考表**:
```typescript
const EXERCISE_TYPES = {
  '慢跑': 7.0,
  '快跑': 11.0,
  '步行': 3.5,
  '游泳': 8.0,
  '騎自行車': 6.8,
  '重量訓練': 6.0,
  '瑜伽': 3.0,
  '有氧運動': 7.3,
  '爬樓梯': 8.8,
  '跳繩': 12.3,
  '籃球': 6.5,
  '羽毛球': 5.5,
  '網球': 7.3,
  '其他': 5.0
};
```

**卡路里計算公式**:
```
消耗卡路里 = MET × 體重(kg) × 運動時間(小時)
```

### 3. WeightRecord (體重記錄)

```prisma
model WeightRecord {
  id      String   @id @default(cuid())
  userId  String
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date    DateTime @unique @db.Date
  weight  Float    // 公斤 (kg)
  bmi     Float?   // BMI 指數
  bodyFat Float?   // 體脂率 (%)
  notes   String?  // 備註
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("weight_records")
}
```

**欄位說明**:
- `date`: 唯一日期 (每日一筆)
- `weight`: 體重 (0.1-300 kg)
- `bmi`: 自動計算 BMI
- `bodyFat`: 選填體脂率
- `notes`: 備註說明

**BMI 計算公式**:
```
BMI = 體重(kg) / (身高(m))²
```

**BMI 分級標準**:
- < 18.5: 過輕 (藍色)
- 18.5-24: 正常 (綠色)
- 24-27: 過重 (黃色)
- ≥ 27: 肥胖 (紅色)

---

## 🔌 API 端點

### 1. Water API (`/api/water`)

#### POST - 新增飲水記錄
```typescript
// Request
{
  "amount": 250  // 毫升
}

// Response
{
  "id": "clxxx",
  "amount": 250,
  "time": "2025-10-28T10:30:00Z"
}
```

**驗證規則**:
- `amount`: 1-5000 (必填)

#### GET - 查詢飲水記錄
```typescript
// Query: /api/water?date=2025-10-28

// Response
{
  "records": [
    {
      "id": "clxxx",
      "amount": 250,
      "time": "2025-10-28T10:30:00Z"
    }
  ],
  "total": 1500,  // 當日總計
  "goal": 2000    // 目標
}
```

#### DELETE - 刪除記錄
```typescript
// Query: /api/water?id=clxxx

// Response
{ "message": "刪除成功" }
```

---

### 2. Exercise API (`/api/exercise`)

#### POST - 新增運動記錄
```typescript
// Request
{
  "type": "慢跑",
  "duration": 30  // 分鐘
}

// Response (自動計算卡路里)
{
  "id": "clxxx",
  "type": "慢跑",
  "duration": 30,
  "calories": 245.0,  // 7.0 × 70kg × 0.5h
  "time": "2025-10-28T10:30:00Z"
}
```

**驗證規則**:
- `type`: 必須是 14 種類型之一
- `duration`: > 0 (必填)

**卡路里計算**:
1. 從 UserProfile 獲取使用者體重
2. 如無體重資料，預設 70kg
3. 公式: `MET × 體重 × (時間/60)`

#### GET - 查詢運動記錄
```typescript
// Query: /api/exercise?date=2025-10-28

// Response
{
  "records": [
    {
      "id": "clxxx",
      "type": "慢跑",
      "duration": 30,
      "calories": 245.0,
      "time": "2025-10-28T10:30:00Z"
    }
  ],
  "totalCalories": 245.0,  // 當日總消耗
  "totalDuration": 30      // 總時長
}
```

#### DELETE - 刪除記錄
```typescript
// Query: /api/exercise?id=clxxx

// Response
{ "message": "刪除成功" }
```

---

### 3. Weight API (`/api/weight`)

#### POST - 新增/更新體重 (Upsert)
```typescript
// Request
{
  "weight": 70.5,
  "bodyFat": 18.5,  // 選填
  "notes": "早餐前測量"  // 選填
}

// Response (自動計算 BMI)
{
  "id": "clxxx",
  "date": "2025-10-28",
  "weight": 70.5,
  "bmi": 22.8,  // 自動計算
  "bodyFat": 18.5,
  "notes": "早餐前測量"
}
```

**驗證規則**:
- `weight`: 0.1-300 (必填)
- `bodyFat`: 0.1-100 (選填)

**Upsert 邏輯**:
- 每日只保留一筆記錄
- 重複日期會更新而非新增

**BMI 計算**:
1. 從 UserProfile 獲取身高
2. 公式: `體重 / (身高/100)²`
3. 若無身高資料，BMI 為 null

#### GET - 查詢體重歷史
```typescript
// Query: /api/weight?limit=30

// Response
{
  "records": [
    {
      "id": "clxxx",
      "date": "2025-10-28",
      "weight": 70.5,
      "bmi": 22.8,
      "bodyFat": 18.5,
      "notes": "早餐前測量"
    }
  ],
  "stats": {
    "current": 70.5,      // 最新體重
    "change": -0.3,       // 與上次變化
    "average": 71.2,      // 平均體重
    "highest": 72.0,      // 最高
    "lowest": 70.0        // 最低
  }
}
```

**統計計算**:
- `current`: 最新記錄的體重
- `change`: current - 前一筆的體重
- `average`: 所有記錄的平均值
- `highest/lowest`: 極值

#### DELETE - 刪除記錄
```typescript
// Query: /api/weight?date=2025-10-28

// Response
{ "message": "刪除成功" }
```

---

## 🎨 UI 元件

### 1. WaterIntakeCard (飲水追蹤卡片)

**檔案**: `/components/nutrition/WaterIntakeCard.tsx` (245 行)

**功能特點**:
- ✅ 快速新增按鈕 (100ml, 200ml, 250ml, 500ml)
- ✅ 自訂數量輸入
- ✅ 進度條視覺化 (藍色漸層)
- ✅ 今日記錄列表
- ✅ 即時刪除功能
- ✅ 目標達成提示

**Props**:
```typescript
interface WaterIntakeCardProps {
  dailyGoal?: number;  // 預設 2000ml
}
```

**使用範例**:
```tsx
<WaterIntakeCard dailyGoal={2500} />
```

**UI 結構**:
```
┌─────────────────────────────────┐
│ 💧 飲水追蹤              [展開] │
├─────────────────────────────────┤
│ 已喝: 1500ml    目標: 2000ml   │
│ [進度條: 75%]                   │
│ 還需 500ml 達成目標             │
├─────────────────────────────────┤
│ 快速新增:                       │
│ [100ml][200ml][250ml][500ml]    │
├─────────────────────────────────┤
│ 自訂數量:                       │
│ [輸入框]  [新增]               │
├─────────────────────────────────┤
│ 今日記錄 (3筆):                │
│ • 250ml - 08:30  [刪除]        │
│ • 500ml - 12:00  [刪除]        │
│ • 750ml - 15:30  [刪除]        │
└─────────────────────────────────┘
```

**狀態管理**:
- `records`: 今日飲水記錄陣列
- `totalAmount`: 今日總量
- `loading`: 載入狀態

---

### 2. ExerciseLogger (運動記錄器)

**檔案**: `/components/nutrition/ExerciseLogger.tsx` (310 行)

**功能特點**:
- ✅ 14 種運動類型選擇器 (含 MET 值顯示)
- ✅ 運動時間輸入
- ✅ 即時預估卡路里消耗
- ✅ 進度條視覺化 (橙色漸層)
- ✅ 今日運動列表
- ✅ 每日消耗總計

**Props**:
```typescript
interface ExerciseLoggerProps {
  dailyCalorieGoal?: number;  // 預設 300 卡
}
```

**運動類型下拉選單**:
```tsx
<select>
  <option>慢跑 (MET: 7.0)</option>
  <option>快跑 (MET: 11.0)</option>
  <option>游泳 (MET: 8.0)</option>
  {/* ...共 14 種 */}
</select>
```

**UI 結構**:
```
┌─────────────────────────────────┐
│ 🏃 運動記錄              [展開] │
├─────────────────────────────────┤
│ 已消耗: 245卡   目標: 300卡    │
│ [進度條: 82%]                   │
├─────────────────────────────────┤
│ 新增運動:                       │
│ 運動類型: [慢跑 ▼]             │
│ 運動時間: [30] 分鐘            │
│ 🔥 預估消耗: 245 卡            │
│ [新增運動記錄]                 │
├─────────────────────────────────┤
│ 今日記錄 (2筆):                │
│ • 慢跑 - 30分鐘 🔥245卡 10:30  │
│ • 游泳 - 45分鐘 🔥336卡 17:00  │
└─────────────────────────────────┘
```

**即時計算**:
```typescript
const estimatedCalories = () => {
  if (!duration) return 0;
  const met = EXERCISE_TYPES[selectedType];
  const hours = parseInt(duration) / 60;
  return Math.round(met * 70 * hours);
};
```

---

### 3. WeightTracker (體重追蹤器)

**檔案**: `/components/nutrition/WeightTracker.tsx` (380 行)

**功能特點**:
- ✅ 體重輸入表單 (支援 0.1kg 精度)
- ✅ BMI 自動計算與分級顯示
- ✅ 體脂率選填
- ✅ 體重趨勢圖表 (Recharts - 最近 30 天)
- ✅ 統計數據卡片 (目前/變化/BMI/平均)
- ✅ 歷史記錄列表
- ✅ Upsert 模式 (每日一筆)

**統計卡片**:
```
┌──────────┬──────────┬──────────┬──────────┐
│ 目前體重  │  變化    │   BMI    │ 平均體重  │
│ 70.5 kg  │ -0.3 kg │ 22.8 正常 │ 71.2 kg  │
└──────────┴──────────┴──────────┴──────────┘
```

**趨勢圖表**:
```tsx
<LineChart data={chartData}>
  <Line 
    type="monotone" 
    dataKey="weight" 
    stroke="#9333ea" 
    strokeWidth={2}
  />
</LineChart>
```

**BMI 狀態顯示**:
```typescript
const getBMIStatus = (bmi: number) => {
  if (bmi < 18.5) return { text: '過輕', color: 'text-blue-600' };
  if (bmi < 24) return { text: '正常', color: 'text-green-600' };
  if (bmi < 27) return { text: '過重', color: 'text-yellow-600' };
  return { text: '肥胖', color: 'text-red-600' };
};
```

**UI 結構**:
```
┌─────────────────────────────────┐
│ ⚖️ 體重追蹤              [展開] │
├─────────────────────────────────┤
│ [統計卡片區塊]                  │
├─────────────────────────────────┤
│ 體重趨勢 (最近 30 天):         │
│ [折線圖]                       │
├─────────────────────────────────┤
│ 記錄今日體重:                   │
│ 體重(kg)*: [70.5]              │
│ 體脂率(%): [18.5]              │
│ 備註: [早餐前測量]             │
│ [儲存記錄]                     │
├─────────────────────────────────┤
│ 歷史記錄 (15筆):               │
│ • 70.5kg - BMI:22.8(正常)      │
│   2025-10-28 體脂:18.5%        │
│ • 70.8kg - BMI:22.9(正常)      │
│   2025-10-27                   │
└─────────────────────────────────┘
```

---

### 4. Nutrition Page (營養總覽頁面)

**檔案**: `/app/nutrition/page.tsx` (105 行)

**頁面結構**:
```
┌─────────────────────────────────────┐
│ 營養追蹤                            │
│ 記錄您的飲水、運動與體重...         │
├─────────────────────────────────────┤
│ [快速統計卡片 × 3]                 │
│  今日飲水    今日消耗    目前體重   │
├─────────────────────────────────────┤
│ [WaterIntakeCard] [ExerciseLogger] │
├─────────────────────────────────────┤
│ [WeightTracker]                     │
├─────────────────────────────────────┤
│ 💡 健康小提醒                       │
│ 💧充足飲水 🏃規律運動 ⚖️定期測量   │
└─────────────────────────────────────┘
```

**快速統計卡片**:
- 藍色: 今日飲水 (ml)
- 橙色: 今日消耗 (卡)
- 紫色: 目前體重 (kg)

---

## 📊 Dashboard 整合

### NutritionSummaryCard (營養摘要卡片)

**檔案**: `/components/dashboard/NutritionSummaryCard.tsx` (190 行)

**功能**:
- ✅ 飲水量進度條
- ✅ 運動消耗進度條
- ✅ 體重變化趨勢
- ✅ 快速提示訊息
- ✅ 連結到完整頁面

**資料來源**:
- 並行請求 3 個 API
- 自動計算進度百分比
- 即時顯示目標達成狀態

**UI 結構**:
```
┌─────────────────────────────────┐
│ 營養追蹤          [查看詳情 →] │
├─────────────────────────────────┤
│ 💧 飲水量                       │
│    1500ml / 2000ml             │
│    [進度條: 75%]               │
├─────────────────────────────────┤
│ 🏃 運動消耗 (2筆)               │
│    245 / 300 卡                │
│    [進度條: 82%]               │
├─────────────────────────────────┤
│ ⚖️ 體重                         │
│    70.5 kg  ⬇️ 0.3kg           │
│    BMI: 22.8                   │
├─────────────────────────────────┤
│ ✅ 飲水目標達成  🏃 保持運動    │
└─────────────────────────────────┘
```

**Dashboard 頁面整合**:
```tsx
// app/(dashboard)/dashboard/page.tsx

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>今日卡路里</Card>
  <Card>營養素分配</Card>
  <NutritionSummaryCard />  {/* 新增 */}
</div>
```

**快捷操作更新**:
```tsx
<Card onClick={() => router.push('/nutrition')}>
  <Activity className="h-10 w-10 text-blue-600" />
  <h3>營養追蹤</h3>
  <p>飲水運動</p>
</Card>
```

---

## 🎯 技術亮點

### 1. 資料庫設計

**複合索引優化**:
```prisma
@@index([userId, date])
```
- 加速按使用者和日期查詢
- 適合日常查詢場景

**Cascade 刪除**:
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```
- 使用者刪除時自動清除關聯記錄

**Unique 約束**:
```prisma
date DateTime @unique @db.Date
```
- 確保每日只有一筆體重記錄

---

### 2. API 設計

**Upsert 模式** (體重 API):
```typescript
await prisma.weightRecord.upsert({
  where: { date: recordDate },
  create: { userId, weight, bmi, bodyFat, date },
  update: { weight, bmi, bodyFat }
});
```
- 避免重複日期
- 簡化更新邏輯

**自動計算邏輯**:
```typescript
// 卡路里計算
const met = EXERCISE_TYPES[type];
const hours = duration / 60;
const calories = met * weight * hours;

// BMI 計算
const heightInMeters = height / 100;
const bmi = weight / (heightInMeters ** 2);
```

**統計查詢優化**:
```typescript
// 一次查詢獲取所有統計
const stats = {
  current: records[0]?.weight,
  change: current - previous,
  average: sum / count,
  highest: Math.max(...weights),
  lowest: Math.min(...weights)
};
```

---

### 3. 前端設計

**即時更新**:
```typescript
const addWater = async (amount: number) => {
  const response = await fetch('/api/water', { ... });
  const newRecord = await response.json();
  
  // 樂觀更新
  setRecords(prev => [newRecord, ...prev]);
  setTotalAmount(prev => prev + amount);
};
```

**Loading 狀態管理**:
```typescript
const [loading, setLoading] = useState(false);

<button disabled={loading}>
  {loading ? '載入中...' : '新增'}
</button>
```

**可折疊介面**:
```typescript
const [isExpanded, setIsExpanded] = useState(true);

<ChevronUp /> // 展開時
<ChevronDown /> // 收合時
```

---

### 4. 視覺化

**Recharts 圖表**:
```tsx
<LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
  <Tooltip />
  <Line 
    type="monotone" 
    dataKey="weight" 
    stroke="#9333ea" 
  />
</LineChart>
```

**漸層進度條**:
```tsx
<div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full" />
```

**動態顏色**:
```typescript
const color = {
  blue: '飲水',
  orange: '運動',
  purple: '體重'
}[type];
```

---

## 📈 使用統計

### 資料庫模型
- **新增模型**: 3 個 (WaterIntake, Exercise, WeightRecord)
- **關聯欄位**: 3 個 (User 關聯)
- **索引**: 3 個複合索引

### API 端點
- **總端點數**: 10 個
- `/api/water`: 3 個 (POST/GET/DELETE)
- `/api/exercise`: 4 個 (POST/GET/DELETE/OPTIONS)
- `/api/weight`: 3 個 (POST/GET/DELETE)

### UI 元件
- **頁面元件**: 1 個 (NutritionPage)
- **功能元件**: 3 個 (Water/Exercise/Weight)
- **Dashboard 元件**: 1 個 (NutritionSummaryCard)
- **總程式碼**: ~1,130 行

### 功能特性
- **運動類型**: 14 種
- **快速按鈕**: 4 個 (飲水)
- **BMI 分級**: 4 級
- **圖表資料**: 最近 30 天
- **統計指標**: 5 個 (體重)

---

## 💡 學習與收穫

### 1. Prisma Upsert 模式

**學到的經驗**:
- Upsert 適合需要「唯一性」的資料
- 簡化「新增或更新」的邏輯
- 減少重複檢查代碼

**實際應用**:
```typescript
// ❌ 舊方法: 先查詢再決定
const existing = await prisma.weightRecord.findUnique({ ... });
if (existing) {
  await prisma.weightRecord.update({ ... });
} else {
  await prisma.weightRecord.create({ ... });
}

// ✅ 新方法: 直接 upsert
await prisma.weightRecord.upsert({
  where: { date },
  create: { ... },
  update: { ... }
});
```

---

### 2. MET 值計算系統

**學習重點**:
- MET (Metabolic Equivalent of Task) 代表運動強度
- 標準公式: `卡路里 = MET × 體重(kg) × 時間(小時)`
- 不同運動的 MET 值差異很大 (瑜伽 3.0 vs 跳繩 12.3)

**資料來源**:
- [Compendium of Physical Activities](https://sites.google.com/site/compendiumofphysicalactivities/)

---

### 3. Recharts 圖表庫

**優點**:
- React 原生元件
- 響應式設計
- 豐富的圖表類型

**使用技巧**:
```tsx
// 動態 Y 軸範圍
<YAxis domain={['dataMin - 2', 'dataMax + 2']} />

// 自訂 Tooltip 樣式
<Tooltip contentStyle={{
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px'
}} />
```

---

### 4. 複合狀態管理

**挑戰**:
- 同時管理多個 API 的資料
- 載入狀態協調
- 錯誤處理

**解決方案**:
```typescript
// 並行請求
const [waterRes, exerciseRes, weightRes] = await Promise.all([
  fetch('/api/water'),
  fetch('/api/exercise'),
  fetch('/api/weight')
]);

// 統一錯誤處理
try {
  // ...
} catch (error) {
  console.error('載入失敗:', error);
} finally {
  setLoading(false);
}
```

---

### 5. 使用者體驗優化

**設計原則**:
1. **快速輸入**: 預設按鈕、智能預設值
2. **即時反饋**: 操作後立即更新 UI
3. **視覺引導**: 進度條、顏色編碼
4. **錯誤提示**: 友善的驗證訊息

**實際應用**:
```tsx
// 快速按鈕
<button onClick={() => addWater(250)}>250ml</button>

// 即時預估
{duration && (
  <span>預估消耗: {estimatedCalories()} 卡</span>
)}

// 目標提示
{waterProgress >= 100 ? '✅ 飲水目標達成' : '💧 記得多喝水'}
```

---

## 🎓 總結

### 已實現功能

✅ **飲水追蹤**
- 快速新增與自訂輸入
- 每日進度視覺化
- 記錄管理 (新增/刪除)

✅ **運動記錄**
- 14 種運動類型
- 自動卡路里計算
- 即時預估消耗

✅ **體重管理**
- BMI 自動計算
- 趨勢圖表顯示
- 統計數據分析

✅ **Dashboard 整合**
- 營養摘要卡片
- 快捷導航連結
- 目標達成狀態

### 技術成果

- **資料庫**: 3 個新模型 + 完整索引
- **API**: 10 個端點,完整 CRUD
- **UI**: 5 個元件,1,130+ 行程式碼
- **整合**: Dashboard + 專屬頁面

### 下一步建議

1. **通知系統**: 定時提醒飲水/運動
2. **目標設定**: 個人化的每日目標
3. **週報月報**: 更詳細的統計分析
4. **資料匯出**: CSV/PDF 報表
5. **社交功能**: 好友排行榜、挑戰賽

---

**完成日期**: 2025-10-28  
**開發者**: GitHub Copilot  
**專案**: Calorie Count - Phase 4 ✅
