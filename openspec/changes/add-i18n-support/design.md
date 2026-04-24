## Context

本專案使用 Next.js 14+ App Router，目前所有 UI 文字為硬編碼繁體中文。需要在不破壞現有功能的前提下，漸進式導入多語系架構。

### 技術選型：next-intl

選擇 `next-intl` 而非 `next-i18next` 或 `react-intl` 的原因：
- **原生 App Router 支援**：專為 Next.js App Router 設計，支援 Server Components
- **Type-safe**：提供 TypeScript 型別推導
- **輕量**：bundle size 小，對效能影響極低
- **活躍維護**：與 Next.js 版本同步更新
- **middleware 整合**：內建 locale 偵測、重導向、URL prefix 管理

### 替代方案
- `next-i18next`：主要針對 Pages Router，對 App Router 支援不完善
- `react-intl` (FormatJS)：功能完整但較重，需要較多 boilerplate
- 自建方案：維護成本高，缺乏 middleware 整合

## Goals / Non-Goals

### Goals
- 建立可擴展的 i18n 架構，初始支援 zh-TW, en, ja
- 語言切換即時生效（無需重新載入頁面）
- 使用者語言偏好可持久化
- SEO 友善（每個語言有獨立 URL，正確的 hreflang 標籤）
- 翻譯檔案按功能模組組織，便於維護

### Non-Goals
- 不實作 RTL（右到左）語言支援（如阿拉伯文）
- 不實作自動翻譯功能
- 不實作翻譯管理後台
- 不處理 AI 辨識結果的多語言化（食物名稱翻譯由 AI 模型處理）

## Decisions

### 1. 路由結構：URL prefix 模式
- 決定：使用 `/[locale]/...` URL prefix 模式
- 原因：SEO 友善、可被搜尋引擎索引、使用者可分享特定語言的連結
- 替代：cookie-based（不利 SEO）、subdomain（部署複雜度高）

### 2. 翻譯檔案組織：按功能模組分層
```
messages/
├── zh-TW.json    # 扁平結構，以 namespace 前綴分組
├── en.json
└── ja.json
```
- 每個 JSON 檔案內部以 namespace 分組：`common`, `auth`, `dashboard`, `meals`, `exercise`, `weight`, `settings`, `goals`, `analytics`, `scan`, `errors`
- 決定：單一檔案而非拆分多檔案，因為本專案規模中等，單檔案便於管理且減少 HTTP 請求

### 3. 預設語言：zh-TW
- 決定：zh-TW 為預設語言，URL 中可省略（`/dashboard` 等同 `/zh-TW/dashboard`）
- 原因：現有使用者全為繁中用戶，避免 URL 變更影響

### 4. 語言偵測優先順序
1. URL path 中的 locale prefix
2. 使用者資料庫中儲存的偏好
3. Cookie (`NEXT_LOCALE`)
4. `Accept-Language` header
5. 預設 `zh-TW`

### 5. 資料庫 Migration
- User model 新增 `preferredLocale String? @default("zh-TW")` 欄位
- 使用 Prisma migration 執行

## Risks / Trade-offs

- **路由結構變更**：所有路由加上 `[locale]` 前綴，需全面更新內部連結 → 使用 `next-intl` 的 `Link` / `useRouter` / `redirect` 包裝函數自動注入 locale
- **翻譯缺失**：某些 key 可能在部分語言中缺失 → 設定 fallback 到 zh-TW
- **Bundle size 增加**：每個語言的翻譯檔案需載入 → next-intl 支援按需載入，僅載入當前語言
- **開發效率**：每次新增 UI 文字都需同步更新翻譯檔 → 可先以 zh-TW 開發，其他語言漸進補齊

## Migration Plan

### Phase 1：基礎架構（不影響現有功能）
1. 安裝 `next-intl`
2. 建立 i18n 配置 (`i18n/config.ts`, `i18n/request.ts`)
3. 建立翻譯檔案 (`messages/zh-TW.json`)
4. 設定 middleware 語言偵測
5. 調整 App Router 結構 (`app/[locale]/...`)

### Phase 2：漸進式遷移
1. 從共用元件開始（Navbar, Sidebar, 通用 UI）
2. 逐頁遷移各功能頁面
3. 遷移 API 錯誤訊息

### Phase 3：新增語言
1. 翻譯 en.json
2. 翻譯 ja.json
3. 新增語言切換 UI

### Phase 4：使用者偏好
1. 資料庫 migration
2. 實作偏好儲存/讀取 API
3. 整合語言切換與使用者偏好

### Rollback
- 還原 `app/[locale]/` 結構回 `app/`
- 移除 middleware locale 邏輯
- 移除 `next-intl` 依賴
- Git revert 即可完全回滾

## Open Questions

- 食物資料庫中的食物名稱是否需要多語言化？（目前建議不處理，由 AI 辨識時根據語言輸出）
- 日期/數字格式是否隨語言切換？（建議使用 `Intl.DateTimeFormat` 和 `Intl.NumberFormat`）
- 是否需要支援繁體中文以外的中文變體（如簡體中文）？
