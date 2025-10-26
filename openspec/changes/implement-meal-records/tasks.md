# 實作任務清單: 飲食記錄管理

## 1. 資料庫 Schema
- [ ] 1.1 建立 MealRecord 模型
- [ ] 1.2 建立 FoodEntry 模型
- [ ] 1.3 建立 MealType enum
- [ ] 1.4 執行資料庫遷移

## 2. API 路由實作
- [ ] 2.1 建立 `app/api/meals/route.ts` (GET 每日記錄, POST 新增)
- [ ] 2.2 建立 `app/api/meals/[id]/route.ts` (PATCH, DELETE)
- [ ] 2.3 建立 `app/api/meals/[id]/foods/route.ts` (新增食物)
- [ ] 2.4 建立 `app/api/meals/stats/route.ts` (統計資料)
- [ ] 2.5 建立 `app/api/foods/search/route.ts` (搜尋食物)
- [ ] 2.6 建立 `app/api/foods/favorites/route.ts` (常用食物)

## 3. UI 元件開發
- [ ] 3.1 建立 `components/meals/meal-section.tsx` (時段區塊)
- [ ] 3.2 建立 `components/meals/food-entry-card.tsx` (食物卡片)
- [ ] 3.3 建立 `components/meals/nutrition-progress.tsx` (進度條)
- [ ] 3.4 建立 `components/meals/add-food-dialog.tsx` (新增對話框)
- [ ] 3.5 建立 `components/meals/food-search.tsx` (搜尋元件)
- [ ] 3.6 建立 `components/meals/date-selector.tsx` (日期選擇)
- [ ] 3.7 建立 `components/meals/nutrition-summary.tsx` (營養摘要)

## 4. 頁面實作
- [ ] 4.1 建立 `app/(dashboard)/meals/page.tsx` (每日記錄)
- [ ] 4.2 建立 `app/(dashboard)/meals/favorites/page.tsx` (常用食物)
- [ ] 4.3 建立 `app/(dashboard)/meals/history/page.tsx` (歷史記錄)

## 5. 測試與驗證
- [ ] 5.1 測試新增/編輯/刪除記錄
- [ ] 5.2 測試營養統計計算
- [ ] 5.3 測試日期切換
- [ ] 5.4 測試食物搜尋
- [ ] 5.5 測試常用食物功能

## 預估時間: 2-3 天
