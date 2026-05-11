## Why

目前網站根路由 `/` 直接 redirect 至登入頁，Google 無法索引任何行銷內容，導致「卡路里計算」、「AI 食物辨識」等核心關鍵字無自然流量入口。
同時存在三個需解決的技術問題：i18n locale 前綴策略導致 hreflang 失效、Dashboard 違反 RSC 邊界規範、登出後語系被重置為預設值。

## What Changes

- **新增** 多語系公開行銷首頁 (`/`、`/en`、`/ja`)，含豐富動畫、功能特色展示、未來訂閱制佔位區塊（價格由後台管理）
- **新增** 行銷首頁 Navbar（含語系切換、登入 / 立即開始 CTA）
- **BREAKING** 將 `localePrefix` 從 `as-needed` 改為 `always`，所有語系路由統一帶前綴（`/zh-TW/login`、`/en/login`、`/ja/login`）
- **修復** 登出時保持使用者當前語系（原本會 redirect 至預設 zh-TW）
- **重構** Dashboard `page.tsx` 拆分為 Server Component wrapper + Client Component，移除 `useState + useEffect` 呼叫 API 違規模式，改用 SWR

## Capabilities

### New Capabilities
- `public-landing-page`: 多語系公開行銷首頁，包含 Hero、功能展示、社會證明、訂閱制 CTA、Footer，使用 Framer Motion 動畫 + Remotion 產品展示動畫片段
- `marketing-navbar`: 公開頁面共用 Navbar，含語系切換與登入 / 立即開始 CTA

### Modified Capabilities
- `user-auth`: 登出流程加入當前 locale 參數，redirect 至 `/{locale}/login` 而非預設路由
- `i18n-routing`: `localePrefix` 改為 `always`，所有相關 URL（alternates、sitemap、OAuth callback）同步更新

## Impact

- `i18n/routing.ts` — `localePrefix: 'always'`（**BREAKING**：所有 zh-TW 路由 URL 變更）
- `app/[locale]/page.tsx` — 從純 redirect 改為條件式渲染（未登入 → 行銷首頁）
- `app/[locale]/(auth)/login/page.tsx`、`register/page.tsx` — alternates URL 更新
- `app/sitemap.ts` — 移除 `defaultLocale` 特判，統一加前綴
- `components/auth/` — 登出 action 加入 locale 參數
- `app/[locale]/(dashboard)/dashboard/page.tsx` — 拆分 RSC 邊界
- 新增 `components/landing/` 目錄（Hero、Features、Pricing、Testimonials、Footer）
- OAuth callback URL 需在各 OAuth provider 後台新增 `/zh-TW/` prefix 路徑
- `bun add framer-motion` — 動畫依賴
