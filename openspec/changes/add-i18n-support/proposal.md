# 新增多國語系支援 (i18n)

## Why

目前系統所有 UI 文字皆為硬編碼繁體中文，無法切換語言。隨著產品國際化需求，需要建立完整的多語系架構，讓使用者可以根據偏好切換介面語言，同時也方便未來擴展更多語言支援。

## What Changes

- 引入 `next-intl` 作為 i18n 框架，整合 Next.js App Router
- 建立翻譯訊息檔案結構 (`messages/[locale].json`)，初始支援 **繁體中文 (zh-TW)**、**英文 (en)**、**日文 (ja)**
- 使用 Next.js middleware 實現語言路由偵測與重導向（基於 URL prefix: `/en/...`, `/zh-TW/...`, `/ja/...`）
- 新增語言切換 UI 元件至 Navbar
- 將所有頁面、元件、API 錯誤訊息中的硬編碼文字替換為翻譯函數 `t('key')`
- 使用者語言偏好持久化（localStorage + 資料庫 user preferences）
- **BREAKING**: App Router 路徑結構變更，所有路由新增 `[locale]` 動態區段

## Impact

- Affected specs: `user-auth`（登入/註冊頁面文字）, `api-standards`（API 錯誤訊息）
- Affected code:
  - `app/` — 所有 `page.tsx`, `layout.tsx` 需移入 `app/[locale]/` 結構
  - `middleware.ts` — 新增語言偵測與路由邏輯
  - `components/` — 所有含硬編碼中文的元件
  - `components/layout/navbar.tsx` — 新增語言切換器
  - `lib/` — 新增 i18n 配置與工具函數
  - `prisma/schema.prisma` — User model 新增 `preferredLocale` 欄位
  - `types/` — 新增 i18n 相關型別定義
- New dependencies: `next-intl`
