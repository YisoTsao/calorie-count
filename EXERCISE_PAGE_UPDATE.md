# 運動記錄頁面功能更新

## 完成的功能

### 1. 編輯功能
- ✅ 添加 Edit icon 到 import
- ✅ 新增編輯相關 state (showEditModal, editingExercise)
- ✅ 實現 handleEdit 函數 - 開啟編輯模式
- ✅ 實現 handleUpdateExercise 函數 - 更新運動記錄 (PUT /api/exercise?id=xxx)
- ✅ 在記錄列表中添加編輯按鈕
- ✅ 新增編輯模態框 UI

### 2. 日期篩選功能
- ✅ 新增日期範圍 state (dateRange, customStartDate, customEndDate)
- ✅ 更新 loadExercises 函數以支援日期範圍查詢
- ✅ 實現 7 種日期篩選選項:
  - 最近 30 天
  - 最近 3 個月
  - 最近 6 個月
  - 最近 1 年
  - 最近 2 年
  - 全部記錄
  - 自訂區間 (帶日期選擇器)
- ✅ 添加日期篩選 UI 元件
- ✅ 顯示當前篩選的記錄數量

### 3. 資料載入改進
- ✅ 更新 API 調用以使用新的查詢參數 (startDate, endDate, limit)
- ✅ 更新資料解析邏輯以匹配新的 API 回應格式 (data.data.exercises)
- ✅ 添加依賴 useEffect 以在日期範圍變更時自動重新載入資料

## API 整合

### GET /api/exercise
支援以下查詢參數:
- `limit`: 限制返回的記錄數量 (預設 1000)
- `startDate`: 開始日期 (YYYY-MM-DD)
- `endDate`: 結束日期 (YYYY-MM-DD)

### PUT /api/exercise?id=xxx
更新運動記錄:
```json
{
  "type": "跑步",
  "duration": 30,
  "calories": 210,
  "notes": "備註"
}
```

## 功能對照

現在運動記錄頁面 (`/exercise`) 已經與體重管理頁面 (`/weight`) 具有相同的功能:
- ✅ 新增記錄
- ✅ 編輯記錄
- ✅ 刪除記錄
- ✅ 日期範圍篩選
- ✅ 自訂日期區間
- ✅ 記錄列表顯示

## 檔案狀態
- 檔案行數: 716 行 (原 430 行)
- Git 衝突: 0 個
- TypeScript 錯誤: 0 個
- 編譯狀態: ✅ 正常

## 注意事項
VS Code 可能需要重新載入視窗以清除快取錯誤:
- 方法 1: Cmd+Shift+P → "Reload Window"
- 方法 2: Cmd+Shift+P → "Developer: Reload Window"
- 方法 3: 重新啟動 VS Code
