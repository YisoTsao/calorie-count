# add-barcode-scan 實作任務清單

## Phase 1: Schema 變更 + DB 遷移

- [ ] 修改 `prisma/schema.prisma`，在 `Food` model 新增：
  - `barcode String? @unique`
  - `openFoodFactsId String?`
  - `openFoodFactsUrl String?`
  - 新增 `@@index([barcode])`
- [ ] 執行 `bunx prisma migrate dev --name add-food-barcode-fields`
- [ ] 確認 migration SQL 產生正確
- [ ] 部署 migration 至 Supabase（執行 `bunx prisma migrate deploy` 或手動套用 migration SQL 至 Supabase dashboard）
- [ ] 驗證 `prisma generate` 更新 client types

## Phase 2: 後端 API

- [ ] 建立 `app/api/foods/barcode/route.ts`
  - GET `?barcode=xxxxxx`
  - 1. 先查本地 DB（`Food.barcode` 欄位快取）
  - 2. 若無快取，呼叫 Open Food Facts API
  - 3. 解析 OFoFacts 回應 → 標準 Food 格式
  - 4. 將結果儲存至 DB（`source: SYSTEM`，`barcode` 欄位）
  - 5. 回傳標準 `{ success, data: { food } }` 格式
- [ ] 處理錯誤情境：
  - 404：條碼不在 OFoFacts 資料庫
  - OFoFacts API timeout（5 秒 timeout）
  - 無效條碼格式（僅允許 8-14 位數字）
- [ ] 新增 rate limiting（避免惡意掃描）

## Phase 3: 前端元件

- [ ] 建立 `components/scan/BarcodeScanDialog.tsx`
  - 使用 BarcodeDetector API（現代瀏覽器）
  - Fallback：手動輸入條碼文字框
  - 掃描中狀態、成功/失敗回饋
  - 支援 `useTranslations('scan')` i18n
- [ ] 建立 `components/scan/BarcodeProductCard.tsx`
  - 展示：品名、品牌、每份量、營養成分
  - 「加入飲食記錄」按鈕
  - 「商品條碼: {barcode}」資訊
  - 「資料來源：Open Food Facts」標示（OFoFacts 授權要求）

## Phase 4: 掃描頁面整合

- [ ] 修改 `app/[locale]/(dashboard)/scan/page.tsx`
  - 新增「條碼掃描」Tab/按鈕（與現有 AI 掃描並排）
  - 點擊後開啟 `BarcodeScanDialog`
  - 掃描成功後，將 food 資料傳入現有 `RecognitionResultDialog` 或新的確認流程

## Phase 5: i18n 翻譯

- [ ] 在 `messages/zh-TW.json` `scan` 命名空間新增：
  - `barcodeTab`: "條碼掃描"
  - `barcodeDesc`: "掃描包裝條碼快速查詢營養資訊"
  - `barcodeScanning`: "掃描中..."
  - `barcodePlaceholder`: "或輸入條碼號碼..."
  - `barcodeNotFound`: "找不到此條碼的商品資訊"
  - `barcodeNotFoundDesc`: "請嘗試 AI 掃描或手動搜尋食物"
  - `barcodeManualEntry`: "手動輸入條碼"
  - `barcodeCameraHint`: "將條碼對準畫面中央"
  - `barcodeSource`: "資料來源: Open Food Facts"
  - `barcodeAddToMeal`: "加入飲食記錄"
- [ ] 同步翻譯至 `messages/en.json`
- [ ] 同步翻譯至 `messages/ja.json`

## Phase 6: 測試與驗證

- [ ] 測試真實商品條碼掃描（例如：台灣常見飲料、零食）
- [ ] 測試查無結果情境
- [ ] 測試第二次掃描同一條碼（驗證快取有效）
- [ ] 測試在 iOS Safari（BarcodeDetector 不支援時的 fallback）
- [ ] 驗證掃描結果可成功加入飲食記錄
- [ ] 驗證三種語言下 UI 正常顯示

## 注意事項

- Open Food Facts 授權：CC BY-SA，使用時需標註「資料來源：Open Food Facts」
- 營養成分欄位名稱對應：OFoFacts `nutriments.energy-kcal_100g` → `calories`
- 若 OFoFacts 無 `energy-kcal_100g`，嘗試 `energy_100g / 4.184`
- 部分商品可能缺少部分營養資訊，需提供預設值 0 並標記為不完整
