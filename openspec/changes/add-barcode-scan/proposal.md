# 新增條碼掃描功能（Open Food Facts）

## Why

目前系統僅支援 AI 圖片辨識食物，但對於包裝食品（如零食、飲料、超市商品），條碼掃描是更快且更精準的方式。Open Food Facts 是全球最大的開源食品資料庫，提供超過 300 萬筆包裝食品的完整營養成分，且完全免費、無需 API Key。整合條碼掃描可以：

1. **提升使用者體驗** — 掃一下包裝條碼即可自動填入完整營養資訊，比手動搜尋快 10 倍
2. **提高資料準確性** — 使用官方廠商條碼資料，比 AI 辨識更準確
3. **豐富食物資料庫** — 每次掃描結果可快取至本地資料庫，累積台灣常見商品資料
4. **完全免費** — Open Food Facts 提供公開 API，無流量費用

## What Changes

### 功能範圍
- 在現有掃描頁 (`/scan`) 新增「條碼掃描」選項（與 AI 拍照並排）
- 使用 HTML5 BarcodeDetector API（主流瀏覽器支援）或 ZXing library（iOS Safari fallback）掃描條碼
- 掃描后調用後端 API `/api/foods/barcode?barcode=xxxxxx`
- 後端查詢 Open Food Facts API: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- 查找結果解析為標準食品格式，並快取至 `Food` table（新增 `barcode` 及 `openFoodFactsId` 欄位）
- 解析出的食品資訊直接進入飲食記錄流程（沿用現有 `RecognitionResultDialog`）

### 新增元件
- `components/scan/BarcodeScanDialog.tsx` — 條碼掃描 UI（camera + 手動輸入 fallback）
- `components/scan/BarcodeProductCard.tsx` — 條碼掃描結果展示卡片

### 新增 API
- `app/api/foods/barcode/route.ts` — GET `?barcode=xxxxxx`，查詢 OFoFacts 並快取

### Schema 變更（需同步 DB）
```prisma
model Food {
  // ...現有欄位...
  barcode          String?  @unique  // 商品條碼 (EAN-13, UPC-A 等)
  openFoodFactsId  String?           // Open Food Facts product ID
  openFoodFactsUrl String?           // 原始來源 URL

  @@index([barcode])
}
```

### i18n
- 新增 `scan.barcodeTab`, `scan.barcodePlaceholder`, `scan.barcodeNotFound`, `scan.barcodeScanning`, `scan.barcodeManualEntry` 翻譯鍵至 `messages/[locale].json`

## Impact

- Affected specs: `food-database`（Food model 新增欄位）, `scan-page`（新增掃描方式）
- Affected code:
  - `prisma/schema.prisma` — Food model 新增三個欄位
  - `app/[locale]/(dashboard)/scan/page.tsx` — 新增條碼掃描入口
  - `app/api/foods/barcode/route.ts` — 新 API route（需新增）
  - `messages/zh-TW.json`, `messages/en.json`, `messages/ja.json` — 新增翻譯鍵
- DB migrations needed: **是** — 需執行 Prisma migration 並同步至 Supabase
- New dependencies: `@zxing/browser` (若需 iOS Safari 相容)

## Non-Goals

- 不建立 Open Food Facts 的完整資料庫同步（只在需要時查詢並快取）
- 不支援自訂條碼格式（僅支援標準 EAN-13, UPC-A, UPC-E, EAN-8）
- 不支援 QR Code（這是另一個功能）

## Success Criteria

1. 使用者可以從掃描頁選擇「條碼掃描」開啟相機
2. 掃描到有效條碼後，1-3 秒內顯示食品資訊
3. 若條碼在 Open Food Facts 找不到，顯示友善提示並允許手動輸入
4. 掃描結果可直接加入飲食記錄
5. 同一條碼第二次掃描時，從本地資料庫快取返回（無網路請求）
6. 功能在 zh-TW、en、ja 三種語言下正常顯示
