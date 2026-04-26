# 條碼掃描技術設計文件

## 1. Open Food Facts API 規格

### 端點
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
```

### 回應結構（關鍵欄位）
```json
{
  "status": 1,                    // 1=found, 0=not found
  "product": {
    "product_name": "可口可樂",
    "product_name_en": "Coca-Cola",    
    "brands": "Coca-Cola",
    "quantity": "350 ml",
    "serving_size": "250 ml",
    "nutriments": {
      "energy-kcal_100g": 42,      // 每 100g 卡路里
      "proteins_100g": 0,
      "carbohydrates_100g": 10.6,
      "fat_100g": 0,
      "fiber_100g": 0,
      "sugars_100g": 10.6,
      "sodium_100g": 0.01
    },
    "code": "4902102081399"         // 條碼
  }
}
```

### 與 Food model 的映射
| OFoFacts 欄位 | Food model 欄位 | 備註 |
|---|---|---|
| `product_name` | `name` | 優先本地化名稱 |
| `product_name_en` | `nameEn` | 英文名稱 |
| `brands` | `brand.name` | 建立/查找 Brand |
| `nutriments.energy-kcal_100g` | `calories` | per 100g |
| `nutriments.proteins_100g` | `protein` | per 100g |
| `nutriments.carbohydrates_100g` | `carbs` | per 100g |
| `nutriments.fat_100g` | `fat` | per 100g |
| `nutriments.fiber_100g` | `fiber` | per 100g |
| `nutriments.sugars_100g` | `sugar` | per 100g |
| `nutriments.sodium_100g` | `sodium` | per 100g (g → mg: × 1000) |
| `serving_size` (parse) | `servingSize` + `servingUnit` | 解析為數字 + 單位 |
| `code` | `barcode` | 唯一鍵 |

## 2. 條碼掃描技術選型

### 方案 A：BarcodeDetector API（推薦）
- 原生瀏覽器 API，無需額外套件
- Chrome 83+, Edge 83+, Android WebView 支援
- **不支援 iOS Safari**（需 fallback）

```typescript
if ('BarcodeDetector' in window) {
  const detector = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'ean_8', 'upc_e'] });
  const imageCapture = new ImageCapture(videoTrack);
  const frame = await imageCapture.grabFrame();
  const barcodes = await detector.detect(frame);
  if (barcodes.length > 0) onScan(barcodes[0].rawValue);
}
```

### 方案 B：ZXing Browser（iOS fallback）
- `@zxing/browser` + `@zxing/library`
- 支援所有主流瀏覽器包含 iOS Safari
- Bundle 較大（~250KB gzip）

### 決策
- 先用 BarcodeDetector（`'BarcodeDetector' in window` 偵測）
- Fallback 到 ZXing（動態 import，只在需要時載入）
- 最終 Fallback：手動輸入文字框

## 3. API Route 設計

### `GET /api/foods/barcode?barcode={barcode}`

```typescript
// 1. 驗證
if (!/^\d{8,14}$/.test(barcode)) return error(400, 'INVALID_BARCODE');

// 2. 本地快取查詢
const cached = await prisma.food.findUnique({ where: { barcode } });
if (cached) return success({ food: cached, cached: true });

// 3. Open Food Facts 查詢
const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
  signal: AbortSignal.timeout(5000) // 5s timeout
});
const data = await res.json();
if (data.status !== 1) return error(404, 'PRODUCT_NOT_FOUND');

// 4. 解析 + 儲存至 DB
const food = await prisma.food.create({ data: mapOFFToFood(data.product, barcode) });
return success({ food, cached: false });
```

### Response 格式
```json
{
  "success": true,
  "data": {
    "food": { ...Food },
    "cached": false,
    "source": "open_food_facts"
  }
}
```

## 4. 快取策略

- **命中快取**：直接從 `Food.barcode` 欄位讀取，不重新查詢 OFoFacts
- **快取失效**：無自動失效（條碼對應的食品資訊基本不變）
- **更新機制**：如果發現快取資料不準確，未來可通過管理介面手動更新

## 5. 授權合規

Open Food Facts 使用 [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1.0/) 授權：
- ✅ 商業用途允許
- ✅ 可修改資料
- ⚠️ 衍生資料庫需使用相同授權
- ⚠️ 需標明來源：`資料來源：Open Food Facts`

在 UI 上需顯示：
```
資料來源：<a href="https://world.openfoodfacts.org">Open Food Facts</a>
```
