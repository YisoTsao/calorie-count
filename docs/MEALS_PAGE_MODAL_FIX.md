# 飲食記錄頁面 Modal 修正說明

## 修正日期
2025-11-01

## 問題描述
1. **Modal 跑版問題**: 手動新增食物的 Modal 在小螢幕上會跑版,超出視窗範圍
2. **缺少新增按鈕**: 當選擇食物後,Modal 底部沒有顯示確認新增的按鈕
3. **新增後未關閉**: 成功新增食物後 Modal 未自動關閉

## 修正內容

### 1. FoodSearchDialog 組件 RWD 優化
**檔案**: `/components/meals/FoodSearchDialog.tsx`

#### DialogContent 容器優化
```tsx
// 修正前
<DialogContent className="max-w-3xl max-h-[80vh] p-0">

// 修正後
<DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] h-auto flex flex-col p-0 gap-0">
```

**改善點**:
- `w-[95vw]`: 手機上佔 95% 寬度,避免貼邊
- `sm:w-full`: 桌面版使用 max-w-3xl
- `max-h-[90vh]`: 增加可用高度
- `flex flex-col`: Flexbox 佈局便於控制內容分配
- `gap-0`: 移除預設間距,手動控制

#### Header 區域響應式間距
```tsx
// 修正前
<DialogHeader className="p-6 pb-4">

// 修正後
<DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
```

**改善點**:
- 手機上使用較小的內距 (px-4, pt-4)
- 桌面版保持原有間距 (px-6, pt-6)
- `flex-shrink-0`: 防止被壓縮

#### Tabs 容器結構優化
```tsx
// 修正前
<Tabs className="flex-1">
  <TabsList className="w-full grid grid-cols-2 mx-6">

// 修正後
<Tabs className="flex-1 flex flex-col min-h-0">
  <div className="px-4 sm:px-6 flex-shrink-0">
    <TabsList className="w-full grid grid-cols-2">
```

**改善點**:
- `flex flex-col min-h-0`: 正確的 Flexbox 子元素配置
- 移除 `mx-6` 改用外層 `px-4 sm:px-6`
- 統一間距管理

#### TabsContent 滾動優化
```tsx
// 修正前
<TabsContent value="search" className="mt-0 px-6">
  <ScrollArea className="h-[400px] pr-4">

// 修正後
<TabsContent value="search" className="mt-4 px-4 sm:px-6 flex-1 flex flex-col min-h-0 overflow-hidden">
  <ScrollArea className="flex-1 -mr-2 pr-2 sm:-mr-4 sm:pr-4">
```

**改善點**:
- `flex-1 flex flex-col min-h-0`: 自動佔滿可用空間
- `overflow-hidden`: 防止內容溢出
- 移除固定高度 `h-[400px]`,改用動態高度
- 響應式內距和滾動條間距

#### 食物項目卡片 RWD
```tsx
// 修正前
<div className="p-4 border rounded-lg ...">
  <h4 className="font-medium">{food.name}</h4>
  <div className="flex items-center gap-3 mt-2 text-sm">

// 修正後
<div className="p-3 sm:p-4 border rounded-lg ...">
  <h4 className="font-medium text-sm sm:text-base truncate">{food.name}</h4>
  <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm flex-wrap">
```

**改善點**:
- 響應式內距和字體大小
- `truncate`: 防止長文字破版
- `flex-wrap`: 允許換行
- `min-w-0`: 正確的文字截斷

#### 底部確認區 RWD
```tsx
// 修正前
<div className="border-t p-6 bg-muted/50">
  <div className="flex items-center gap-4 mb-4">
    <Input className="w-20 text-center" />

// 修正後
<div className="border-t px-4 sm:px-6 py-4 sm:py-6 bg-muted/50 flex-shrink-0">
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
    <Input className="w-16 sm:w-20 text-center" />
```

**改善點**:
- 手機上垂直排列,桌面版水平排列
- 響應式間距和輸入框寬度
- `flex-shrink-0`: 確保底部區域完整顯示

#### 營養資訊網格 RWD
```tsx
// 修正前
<div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-background rounded-lg">
  <p className="font-medium">

// 修正後
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-background rounded-lg">
  <p className="text-sm sm:text-base font-medium">
```

**改善點**:
- 手機上 2 欄,桌面版 4 欄
- 響應式字體和間距
- 更好的小螢幕閱讀體驗

### 2. 飲食記錄頁面功能修正
**檔案**: `/app/(dashboard)/meals/page.tsx`

#### handleAddFood 函數優化
```tsx
// 修正重點
const handleAddFood = async (food: { id: string }, servings: number) => {
  setIsAddingFood(true);
  try {
    // ... 創建餐次和新增食物邏輯 ...
    
    // ✅ 成功後關閉 modal
    setIsSearchDialogOpen(false);
    
    // ✅ 刷新餐次資料
    await fetchMeals();
  } catch (error) {
    // ✅ 顯示具體錯誤訊息
    const errorMessage = error instanceof Error ? error.message : '新增食物失敗,請稍後再試';
    alert(errorMessage);
  } finally {
    setIsAddingFood(false);
  }
};
```

**改善點**:
1. **自動關閉 Modal**: 成功新增後呼叫 `setIsSearchDialogOpen(false)`
2. **錯誤處理**: 顯示 API 回傳的具體錯誤訊息
3. **日期比對**: 使用 `mealDate.startsWith(selectedDate)` 比對日期
4. **ISO 日期格式**: `new Date(selectedDate).toISOString()`

### 3. API 驗證調整
**檔案**: `/app/api/meals/route.ts`

#### 允許空 foods 陣列
```tsx
// 修正前
foods: z.array(...).min(1, '至少要有一項食物'),

// 修正後
foods: z.array(...).optional().default([]),
```

**原因**: 
- 手動新增流程是先建立空餐次,再用 `/api/meals/[id]/foods` 新增食物
- 與 AI 掃描流程不同(一次新增所有食物)

#### GET /api/meals 參數驗證修正
```tsx
// 修正前
const validation = getMealsSchema.safeParse({ date, mealType, startDate, endDate });

// 修正後
const paramsToValidate: Record<string, string> = {};
if (date) paramsToValidate.date = date;
if (mealType) paramsToValidate.mealType = mealType;
if (startDate) paramsToValidate.startDate = startDate;
if (endDate) paramsToValidate.endDate = endDate;

const validation = getMealsSchema.safeParse(paramsToValidate);
```

**原因**:
- 避免將 `null` 值傳入 Zod 驗證
- 只驗證實際傳入的參數
- 修正 `/api/meals?date=2025-10-26` 的 VALIDATION_ERROR

## 測試重點

### 桌面版 (>=640px)
- [x] Modal 寬度為 max-w-3xl
- [x] 所有內容正確顯示
- [x] 營養資訊為 4 欄網格
- [x] 份數調整區域水平排列
- [x] 選擇食物後底部顯示確認區

### 手機版 (<640px)
- [x] Modal 寬度為 95vw,不超出螢幕
- [x] 內容可完整滾動
- [x] 營養資訊為 2 欄網格
- [x] 份數調整區域垂直排列
- [x] 所有文字不會被截斷或超出

### 功能測試
- [x] 搜尋食物正常顯示
- [x] 分類篩選正常運作
- [x] 常用食物頁籤正常
- [x] 選擇食物後底部確認區顯示
- [x] 調整份數營養數值即時更新
- [x] 點擊「加入餐點」成功新增
- [x] 新增後 Modal 自動關閉
- [x] 新增後清單即時更新
- [x] 錯誤時顯示具體錯誤訊息

### API 測試
- [x] `/api/meals?date=2025-10-26` 不再報錯
- [x] `/api/meals` POST 接受空 foods 陣列
- [x] `/api/meals/[id]/foods` POST 正常運作

## 相關檔案
- `/components/meals/FoodSearchDialog.tsx` - Modal 組件
- `/app/(dashboard)/meals/page.tsx` - 飲食記錄頁面
- `/app/api/meals/route.ts` - 餐次 CRUD API
- `/app/api/meals/[id]/foods/route.ts` - 餐次食物管理 API

## 技術要點

### Flexbox 滾動佈局
正確的模式:
```tsx
<div className="flex flex-col max-h-[90vh]">
  <div className="flex-shrink-0">{/* Header */}</div>
  <div className="flex-1 flex flex-col min-h-0">
    <ScrollArea className="flex-1">{/* Content */}</ScrollArea>
  </div>
  <div className="flex-shrink-0">{/* Footer */}</div>
</div>
```

### Tailwind 響應式斷點
- `sm:` >= 640px (平板直立)
- `md:` >= 768px (平板橫向)
- `lg:` >= 1024px (桌面)

### 文字截斷
- `truncate` = `overflow-hidden text-ellipsis whitespace-nowrap`
- 需配合 `min-w-0` 在 flex 子元素中

## 後續建議
1. 考慮新增 Toast 通知取代 alert
2. 新增食物時可顯示 loading 狀態
3. 考慮新增「最近使用」食物快速選擇
4. 優化搜尋效能(debounce 已實作)
