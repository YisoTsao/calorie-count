# 實作營養追蹤功能 - 任務清單

預估時間: 2 天

## 1. 資料庫 Schema (4 tasks)
- [ ] 新增 WaterIntake model 到 Prisma schema
- [ ] 新增 Exercise model 到 Prisma schema
- [ ] 新增 WeightRecord model 到 Prisma schema
- [ ] 執行 migration

## 2. API Routes (9 tasks)
### 水分記錄
- [ ] POST /api/water - 新增水分記錄
- [ ] GET /api/water?date=YYYY-MM-DD - 取得指定日期水分記錄

### 運動記錄
- [ ] POST /api/exercise - 新增運動記錄
- [ ] GET /api/exercise?date=YYYY-MM-DD - 取得指定日期運動記錄
- [ ] DELETE /api/exercise/[id] - 刪除運動記錄

### 體重記錄
- [ ] POST /api/weight - 新增體重記錄
- [ ] GET /api/weight?from=YYYY-MM-DD&to=YYYY-MM-DD - 取得體重範圍記錄
- [ ] PATCH /api/weight/[id] - 更新體重記錄

### 每日摘要
- [ ] GET /api/daily-summary?date=YYYY-MM-DD - 取得每日營養摘要

## 3. UI 元件 (8 tasks)
- [ ] WaterIntakeCard - 水分追蹤卡片 (快速按鈕 + 進度條)
- [ ] ExerciseCard - 運動記錄卡片
- [ ] WeightCard - 體重記錄卡片
- [ ] DailySummaryCard - 每日摘要卡片
- [ ] ExerciseTypeSelect - 運動類型選擇器
- [ ] WeightChart - 體重趨勢圖 (使用 recharts)
- [ ] QuickWaterButton - 快速新增水分按鈕
- [ ] ExerciseDialog - 新增運動對話框

## 4. 頁面實作 (3 tasks)
- [ ] app/(dashboard)/nutrition/page.tsx - 營養追蹤主頁面
- [ ] app/(dashboard)/weight/page.tsx - 體重管理頁面
- [ ] app/(dashboard)/exercise/page.tsx - 運動記錄頁面

## 5. 工具函數 (3 tasks)
- [ ] lib/calculations/exercise.ts - 運動消耗卡路里計算
- [ ] lib/calculations/daily-summary.ts - 每日摘要計算
- [ ] lib/calculations/bmi.ts - BMI 計算 (已在 Phase 2)

## 6. 測試 (5 tasks)
- [ ] API: 水分記錄 CRUD 測試
- [ ] API: 運動記錄 CRUD 測試
- [ ] API: 體重記錄 CRUD 測試
- [ ] API: 每日摘要計算正確性測試
- [ ] UI: 元件交互測試

---

**總任務數**: 32
**預估時間**: 2 天
**依賴**: implement-meal-records
