# 實作數據分析與報表 - 任務清單

預估時間: 3-4 天

## 1. 安裝依賴 (5 tasks)
- [ ] 安裝 recharts
- [ ] 安裝 chart.js + react-chartjs-2
- [ ] 安裝 @react-pdf/renderer
- [ ] 安裝 html2canvas
- [ ] 安裝 lodash + @types/lodash

## 2. 資料庫 Schema (3 tasks)
- [ ] 新增 Achievement model 到 Prisma schema
- [ ] 新增 DailyStats model 到 Prisma schema
- [ ] 執行 migration

## 3. 數據聚合服務 (6 tasks)
- [ ] lib/analytics/aggregation.ts - 數據聚合函數
- [ ] lib/analytics/trends.ts - 趨勢計算
- [ ] lib/analytics/achievements.ts - 成就檢查邏輯
- [ ] lib/analytics/recommendations.ts - 智能建議生成
- [ ] lib/analytics/daily-stats.ts - 每日統計更新
- [ ] lib/analytics/export.ts - 匯出功能

## 4. API Routes (8 tasks)
### 趨勢分析
- [ ] GET /api/analytics/trends?period=week|month - 取得趨勢數據
- [ ] GET /api/analytics/nutrition-breakdown?from=&to= - 營養素分析

### 成就系統
- [ ] GET /api/achievements - 取得使用者成就
- [ ] POST /api/achievements/check - 檢查並解鎖成就

### 統計數據
- [ ] GET /api/stats/daily?date=YYYY-MM-DD - 每日統計
- [ ] GET /api/stats/summary?period=week|month - 摘要統計

### 匯出
- [ ] POST /api/export/pdf - 生成 PDF 報表
- [ ] POST /api/export/csv - 匯出 CSV 數據

## 5. 圖表元件 (10 tasks)
- [ ] CalorieTrendChart - 卡路里趨勢圖 (折線圖)
- [ ] NutritionPieChart - 營養素比例圖 (圓餅圖)
- [ ] WeightProgressChart - 體重進度圖 (折線圖 + 目標線)
- [ ] WaterIntakeBarChart - 水分攝取柱狀圖
- [ ] ExerciseBarChart - 運動消耗柱狀圖
- [ ] MacronutrientStackedBar - 三大營養素堆疊圖
- [ ] GoalProgressRadial - 目標達成率環形圖
- [ ] StreakCalendar - 連續打卡日曆熱圖
- [ ] ComparisonChart - 週/月對比圖
- [ ] ChartContainer - 圖表容器元件 (統一樣式)

## 6. 成就系統元件 (5 tasks)
- [ ] AchievementBadge - 成就徽章元件
- [ ] AchievementCard - 成就卡片
- [ ] AchievementWall - 成就牆展示
- [ ] AchievementNotification - 解鎖通知
- [ ] StreakCounter - 連續打卡計數器

## 7. 報表元件 (4 tasks)
- [ ] WeeklyReport - 週報表元件
- [ ] MonthlyReport - 月報表元件
- [ ] PDFReport - PDF 報表模板 (@react-pdf/renderer)
- [ ] ShareableImage - 可分享圖片生成

## 8. 頁面實作 (4 tasks)
- [ ] app/(dashboard)/analytics/page.tsx - 數據分析主頁面
- [ ] app/(dashboard)/reports/page.tsx - 報表頁面
- [ ] app/(dashboard)/achievements/page.tsx - 成就頁面
- [ ] app/(dashboard)/insights/page.tsx - 智能洞察頁面

## 9. 背景任務 (3 tasks)
- [ ] 建立 Cron Job 每日更新 DailyStats
- [ ] 建立 Cron Job 每日檢查成就解鎖
- [ ] 建立數據清理任務 (刪除舊數據)

## 10. 工具函數 (4 tasks)
- [ ] lib/utils/date-ranges.ts - 日期範圍處理
- [ ] lib/utils/chart-colors.ts - 圖表配色方案
- [ ] lib/utils/number-format.ts - 數字格式化
- [ ] lib/utils/export-helpers.ts - 匯出輔助函數

## 11. 測試 (6 tasks)
- [ ] API: 趨勢數據計算正確性測試
- [ ] API: 成就解鎖邏輯測試
- [ ] API: PDF 生成測試
- [ ] UI: 圖表渲染測試
- [ ] UI: 成就系統測試
- [ ] 整合: 數據聚合端到端測試

---

**總任務數**: 58
**預估時間**: 3-4 天
**依賴**: implement-nutrition-tracking
