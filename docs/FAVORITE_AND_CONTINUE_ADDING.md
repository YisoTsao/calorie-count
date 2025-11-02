# 功能優化說明 - 我的最愛與繼續新增

## 修正日期
2025-11-01

## 修正內容

### 1. 我的最愛功能優化 (/foods 頁面)

#### 問題
- API 呼叫時只傳送 `{ foodId: "..." }`,缺少狀態參數
- API 無法區分是要新增還是移除收藏
- 導致只能新增,無法移除收藏

#### 修正

**API 端** (`/app/api/foods/favorites/route.ts`):

```typescript
// POST /api/foods/favorites
export async function POST(request: NextRequest) {
  const { foodId, isFavorite } = await request.json();
  
  // 如果 isFavorite 為 false,則移除收藏
  if (isFavorite === false) {
    await prisma.userFavoriteFood.delete({
      where: {
        userId_foodId: { userId: session.user.id, foodId }
      }
    });
    return NextResponse.json({ 
      success: true,
      isFavorite: false,
      message: '已移除收藏' 
    });
  }
  
  // 如果 isFavorite 為 true 或未指定,則新增收藏
  const favorite = await prisma.userFavoriteFood.upsert({
    where: {
      userId_foodId: { userId: session.user.id, foodId }
    },
    create: { userId: session.user.id, foodId, useCount: 1, lastUsed: new Date() },
    update: { lastUsed: new Date() }
  });
  
  return NextResponse.json({ 
    success: true,
    isFavorite: true,
    message: '已加入收藏' 
  });
}
```

**前端** (`/app/(dashboard)/foods/page.tsx`):

```typescript
const handleToggleFavorite = async (foodId: string) => {
  // 1. 取得當前狀態
  const currentFood = foods.find(f => f.id === foodId);
  const newIsFavorite = !currentFood?.isFavorite;
  
  // 2. 樂觀更新 UI
  setFoods(prevFoods => 
    prevFoods.map(food => 
      food.id === foodId 
        ? { ...food, isFavorite: newIsFavorite }
        : food
    )
  );
  
  // 3. 呼叫 API (傳送新的狀態)
  const response = await fetch('/api/foods/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      foodId,
      isFavorite: newIsFavorite  // ✅ 新增狀態參數
    }),
  });
  
  // 4. 如果在「我的最愛」分類且取消收藏,重新載入移除項目
  if (response.ok && selectedCategory === 'favorites' && !newIsFavorite) {
    await fetchFoods();
  }
};
```

**改善重點**:
1. ✅ API payload 包含 `isFavorite` 參數
2. ✅ API 根據參數決定新增或移除
3. ✅ 取消收藏時正確刪除資料庫記錄
4. ✅ 在「我的最愛」分類中取消收藏會移除項目
5. ✅ 使用 `lastUsed` 而非 `useCount` 追蹤最後使用時間

---

### 2. 飲食記錄繼續新增功能 (/meals 頁面)

#### 需求
- 新增食物後不關閉 Modal
- 讓使用者可以連續新增多個食物
- 提供「加入並繼續」和「加入並完成」兩種選項

#### 修正

**Modal 組件** (`/components/meals/FoodSearchDialog.tsx`):

```typescript
const handleConfirm = () => {
  if (selectedFood) {
    onSelectFood(selectedFood, servings);
    // ✅ 重置選擇但保持 dialog 開啟
    setSelectedFood(null);
    setServings(1);
    // ❌ 移除 handleClose() - 不關閉 Modal
  }
};
```

**按鈕區域重新設計**:

```tsx
<div className="flex flex-col sm:flex-row gap-2">
  {/* 重新選擇 - 清除當前選擇 */}
  <Button 
    variant="outline" 
    onClick={() => setSelectedFood(null)} 
    className="flex-1 order-3 sm:order-1"
  >
    重新選擇
  </Button>
  
  {/* 加入並繼續 - 新增後保持開啟 */}
  <Button 
    onClick={handleConfirm} 
    className="flex-1 order-1 sm:order-2"
  >
    加入並繼續
  </Button>
  
  {/* 加入並完成 - 新增後關閉 */}
  <Button 
    onClick={() => {
      handleConfirm();
      setTimeout(() => handleClose(), 100);
    }} 
    variant="default"
    className="flex-1 order-2 sm:order-3"
  >
    加入並完成
  </Button>
</div>
```

**RWD 處理**:
- 手機版: 垂直排列,按鈕順序為「加入並繼續」→「加入並完成」→「重新選擇」
- 桌面版: 水平排列,按鈕順序為「重新選擇」→「加入並繼續」→「加入並完成」
- 使用 `order-*` 類別控制不同螢幕尺寸的顯示順序

**頁面處理** (`/app/(dashboard)/meals/page.tsx`):

```typescript
const handleAddFood = async (food: { id: string }, servings: number) => {
  setIsAddingFood(true);
  try {
    // ... 創建餐次和新增食物 ...
    
    // ✅ 只刷新資料,不關閉 Modal
    await fetchMeals();
    
    // ❌ 移除: setIsSearchDialogOpen(false)
  } catch (error) {
    // 錯誤處理
  } finally {
    setIsAddingFood(false);
  }
};
```

---

## 使用流程

### 我的最愛功能
1. 在 `/foods` 頁面瀏覽食物
2. 點擊愛心圖示:
   - 空心❤️ → 實心❤️ (加入收藏)
   - 實心❤️ → 空心❤️ (移除收藏)
3. 選擇「❤️ 我的最愛」分類查看所有收藏
4. 在收藏列表中點擊愛心取消收藏,該項目會從列表中移除

### 繼續新增功能
1. 在 `/meals` 頁面點擊「手動新增」
2. 搜尋並選擇一個食物
3. 調整份數
4. 選擇操作:
   - **加入並繼續**: 新增食物後,Modal 保持開啟,可以繼續選擇其他食物
   - **加入並完成**: 新增食物後關閉 Modal
   - **重新選擇**: 取消當前選擇,重新挑選食物
5. 新增的食物立即顯示在對應餐別卡片中

---

## 技術細節

### API 請求格式

**新增/移除收藏**:
```json
POST /api/foods/favorites
{
  "foodId": "uuid",
  "isFavorite": true  // true=新增, false=移除
}
```

**回應格式**:
```json
{
  "success": true,
  "isFavorite": true,
  "message": "已加入收藏",
  "favorite": { ... }  // 僅在新增時回傳
}
```

### 樂觀 UI 更新
```typescript
// 1. 立即更新 UI
setFoods(prevFoods => 
  prevFoods.map(food => 
    food.id === foodId ? { ...food, isFavorite: newIsFavorite } : food
  )
);

// 2. 呼叫 API
const response = await fetch(...);

// 3. 如果失敗,還原狀態
if (!response.ok) {
  setFoods(prevFoods => 
    prevFoods.map(food => 
      food.id === foodId ? { ...food, isFavorite: !newIsFavorite } : food
    )
  );
}
```

### Modal 狀態管理
- `selectedFood`: 當前選擇的食物
- `servings`: 份數
- `isSearchDialogOpen`: Modal 開啟狀態
- `isAddingFood`: 新增中的載入狀態

**重置選擇 vs 關閉 Modal**:
- 重置選擇: `setSelectedFood(null)` - 保持 Modal 開啟
- 關閉 Modal: `onOpenChange(false)` - 同時重置所有狀態

---

## 測試重點

### 我的最愛測試
- [x] 點擊空心愛心變實心,API 呼叫包含 `isFavorite: true`
- [x] 點擊實心愛心變空心,API 呼叫包含 `isFavorite: false`
- [x] 在「我的最愛」分類中取消收藏,項目從列表移除
- [x] 重新整理頁面,收藏狀態保持正確
- [x] 資料庫中 `UserFavoriteFood` 記錄正確新增/刪除

### 繼續新增測試
- [x] 點擊「加入並繼續」後 Modal 保持開啟
- [x] 選擇欄位已重置 (selectedFood = null, servings = 1)
- [x] 可以立即選擇下一個食物
- [x] 點擊「加入並完成」後 Modal 關閉
- [x] 點擊「重新選擇」清除當前選擇但保持開啟
- [x] 新增的食物即時顯示在餐別卡片中
- [x] 手機版按鈕順序正確 (繼續優先)

### 錯誤處理測試
- [x] API 失敗時 UI 狀態正確還原
- [x] 錯誤訊息正確顯示
- [x] 網路錯誤時不會卡住

---

## 相關檔案
- `/app/api/foods/favorites/route.ts` - 我的最愛 API
- `/app/(dashboard)/foods/page.tsx` - 食物頁面
- `/components/meals/FoodSearchDialog.tsx` - 食物搜尋 Modal
- `/app/(dashboard)/meals/page.tsx` - 飲食記錄頁面

## 後續建議
1. 考慮新增 Toast 通知顯示「已加入」/「已移除」訊息
2. 新增「批次新增」功能 (多選食物後一次加入)
3. 考慮在 Modal 頂部顯示「已加入 X 項食物」的計數器
4. 新增鍵盤快捷鍵 (Enter=繼續, Shift+Enter=完成)
