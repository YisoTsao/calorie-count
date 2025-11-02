# 我的最愛與來源篩選修正

## 修正日期
2025-11-01

## 問題描述

### 1. 我的最愛分類愛心顏色問題
**問題**: 當選擇「❤️ 我的最愛」分類時,食物卡片上的愛心圖示仍然是空心(未填充),應該要顯示紅色實心愛心。

**原因**: `/api/foods/favorites` 回傳的資料中,`isFavorite` 屬性可能未正確設置或為 `undefined`。

### 2. 來源選擇器篩選失效
**問題**: 
- 選擇「我的最愛」分類後,切換「所有來源」/「系統食物」/「自訂食物」時,搜尋結果沒有變化
- 選擇「系統食物」時,API 邏輯不正確

## 修正內容

### 1. 我的最愛分類愛心顏色修正

**檔案**: `/app/(dashboard)/foods/page.tsx`

```typescript
const fetchFoods = async () => {
  setIsLoading(true);
  try {
    if (selectedCategory === 'favorites') {
      const response = await fetch('/api/foods/favorites');
      if (response.ok) {
        const data = await response.json();
        
        // ✅ 確保所有我的最愛食物的 isFavorite 都是 true
        let favoriteFoods = (data.favorites || []).map((food: Food) => ({
          ...food,
          isFavorite: true,  // 強制設置為 true
        }));
        
        // 如果有選擇來源,進行篩選
        if (selectedSource && selectedSource !== 'all') {
          favoriteFoods = favoriteFoods.filter(
            (food: Food) => food.source === selectedSource
          );
        }
        
        // 如果有搜尋關鍵字,進行篩選
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          favoriteFoods = favoriteFoods.filter((food: Food) => 
            food.name.toLowerCase().includes(query) ||
            (food.nameEn && food.nameEn.toLowerCase().includes(query))
          );
        }
        
        setFoods(favoriteFoods);
        setPagination({
          page: 1,
          limit: 20,
          total: favoriteFoods.length,
          totalPages: 1,
        });
      }
    } else {
      // 一般搜尋邏輯...
    }
  } catch (error) {
    console.error('Failed to fetch foods:', error);
  } finally {
    setIsLoading(false);
  }
};
```

**改善點**:
1. ✅ 強制設置 `isFavorite: true` 給所有我的最愛食物
2. ✅ 在我的最愛分類中也支援來源篩選
3. ✅ 在我的最愛分類中也支援搜尋關鍵字

---

### 2. 來源篩選邏輯修正

**檔案**: `/app/api/foods/search/route.ts`

#### 修正前的問題
```typescript
// ❌ 問題邏輯
if (source && ['SYSTEM', 'USER', 'API'].includes(source)) {
  where.source = source;  // 直接設置來源
} else {
  // 預設顯示系統食物和使用者自己的食物
  where.AND = [
    {
      OR: [
        { source: 'SYSTEM' },
        { source: 'USER', userId: session.user.id },
      ],
    },
  ];
}
```

**問題**:
- 選擇「系統食物」時,`where.source = 'SYSTEM'`,但沒有限制 userId
- 這會導致看到其他使用者的系統食物(雖然系統食物本來就是共享的)
- 選擇「自訂食物」時,`where.source = 'USER'`,但沒有限制 userId
- 這會導致看到其他使用者的自訂食物(這是錯的!)

#### 修正後的邏輯
```typescript
// ✅ 正確邏輯
if (source && ['SYSTEM', 'USER', 'API'].includes(source)) {
  if (source === 'USER') {
    // 自訂食物: 只顯示使用者自己的食物
    where.AND = [
      { source: 'USER' },
      { userId: session.user.id },
    ];
  } else {
    // 系統食物或 API 食物: 直接篩選來源
    where.source = source as 'SYSTEM' | 'USER' | 'API';
  }
} else {
  // 預設顯示系統食物和使用者自己的食物
  where.OR = [
    { source: 'SYSTEM' },
    { source: 'USER', userId: session.user.id },
  ];
}
```

**改善點**:
1. ✅ **自訂食物**: 必須同時滿足 `source = 'USER'` 和 `userId = 當前使用者`
2. ✅ **系統食物**: 只需要 `source = 'SYSTEM'` (所有使用者共享)
3. ✅ **所有來源**: 顯示系統食物 + 使用者自己的自訂食物

---

## 功能說明

### 來源篩選行為

| 選擇來源 | 顯示內容 | 說明 |
|---------|---------|------|
| **所有來源** | 系統食物 + 我的自訂食物 | 預設行為,不顯示其他人的自訂食物 |
| **系統食物** | 系統食物 | 只顯示官方/預設的食物資料庫 |
| **自訂食物** | 我的自訂食物 | 只顯示自己新增的食物 |

### 我的最愛 + 來源篩選組合

當選擇「❤️ 我的最愛」分類時:

| 組合 | 結果 |
|------|------|
| 我的最愛 + 所有來源 | 所有收藏的食物(系統+自訂) |
| 我的最愛 + 系統食物 | 只顯示收藏的系統食物 |
| 我的最愛 + 自訂食物 | 只顯示收藏的自訂食物 |

所有結果中的愛心圖示都會是紅色實心 ❤️

### 我的最愛 + 搜尋關鍵字

- ✅ 支援在收藏列表中搜尋
- ✅ 搜尋中文名稱和英文名稱
- ✅ 不區分大小寫

---

## 測試重點

### 我的最愛愛心顏色
- [x] 選擇「❤️ 我的最愛」分類
- [x] 所有食物卡片上的愛心都是紅色實心
- [x] 愛心有填充效果 (`fill-current` class)
- [x] 按鈕文字是「取消收藏」

### 來源篩選
- [x] **所有來源**: 顯示系統食物 + 我的自訂食物
- [x] **系統食物**: 只顯示系統食物
- [x] **自訂食物**: 只顯示我的自訂食物
- [x] 不會看到其他使用者的自訂食物

### 我的最愛 + 來源篩選
- [x] 選擇「我的最愛 + 所有來源」: 顯示所有收藏
- [x] 選擇「我的最愛 + 系統食物」: 只顯示收藏的系統食物
- [x] 選擇「我的最愛 + 自訂食物」: 只顯示收藏的自訂食物
- [x] 切換來源時結果即時更新
- [x] 所有愛心都是紅色

### 我的最愛 + 搜尋
- [x] 在我的最愛中輸入關鍵字
- [x] 結果即時篩選
- [x] 支援中英文搜尋
- [x] 搜尋結果的愛心仍是紅色

### 邊界情況
- [x] 我的最愛列表為空時顯示提示
- [x] 篩選後無結果時顯示提示
- [x] 取消收藏後,在我的最愛分類中該項目消失
- [x] 數量顯示正確 (「找到 X 項食物」)

---

## 資料庫查詢邏輯

### 所有來源 (預設)
```prisma
where: {
  OR: [
    { source: 'SYSTEM' },
    { source: 'USER', userId: session.user.id }
  ]
}
```

### 系統食物
```prisma
where: {
  source: 'SYSTEM'
}
```

### 自訂食物
```prisma
where: {
  AND: [
    { source: 'USER' },
    { userId: session.user.id }
  ]
}
```

---

## UI 表現

### 愛心圖示狀態

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleToggleFavorite(food.id)}
  title={food.isFavorite ? '取消收藏' : '加入最愛'}
  className={food.isFavorite ? 'text-red-500' : ''}
>
  <Heart className={`h-4 w-4 ${food.isFavorite ? 'fill-current' : ''}`} />
</Button>
```

- **未收藏**: 空心愛心,灰色 (預設顏色)
- **已收藏**: 實心愛心,紅色 (`text-red-500` + `fill-current`)

### 在我的最愛分類中
- 所有食物的 `isFavorite` 都是 `true`
- 所有愛心都是紅色實心
- Tooltip 顯示「取消收藏」

---

## 相關檔案
- `/app/(dashboard)/foods/page.tsx` - 食物頁面主邏輯
- `/app/api/foods/search/route.ts` - 食物搜尋 API
- `/app/api/foods/favorites/route.ts` - 我的最愛 API

## 技術細節

### 前端篩選 vs API 篩選
- **一般搜尋**: 使用 API 參數篩選 (分頁、效能)
- **我的最愛搜尋**: 前端篩選 (資料量小,即時反應)

### Prisma 查詢條件組合
```typescript
// AND: 所有條件都要滿足
where: {
  AND: [
    { source: 'USER' },
    { userId: 'xxx' }
  ]
}

// OR: 任一條件滿足即可
where: {
  OR: [
    { source: 'SYSTEM' },
    { source: 'USER', userId: 'xxx' }
  ]
}
```

### 陣列方法鏈式使用
```typescript
let foods = data.favorites.map(f => ({ ...f, isFavorite: true }));
foods = foods.filter(f => f.source === selectedSource);
foods = foods.filter(f => f.name.includes(searchQuery));
```

每一步都會返回新陣列,保持不可變性。

---

## 後續建議
1. 考慮新增「最近使用」篩選
2. 新增「使用次數」排序選項
3. 支援多選來源 (系統+自訂)
4. 我的最愛分類也支援分頁 (當收藏很多時)
5. 新增快速切換「只看收藏」的開關
