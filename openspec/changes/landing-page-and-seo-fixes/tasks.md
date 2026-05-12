## 1. 前置作業與依賴安裝

- [x] 1.1 安裝 `framer-motion`：`bun add framer-motion`
- [x] 1.2 在 `messages/zh-TW.json`、`en.json`、`ja.json` 新增 `landing` namespace（含 Hero、Features、HowItWorks、Stats、Pricing、Testimonials、Footer 文案）
- [x] 1.3 在 `messages/en.json` 的 `landing.features` 中補齊 8 個功能特色的英文翻譯
- [x] 1.4 在 `messages/ja.json` 的 `landing` namespace 補齊所有日文翻譯

## 2. i18n localePrefix 遷移（BREAKING）

- [x] 2.1 修改 `i18n/routing.ts`：`localePrefix: 'as-needed'` → `localePrefix: 'always'`
- [x] 2.2 修改 `proxy.ts`（middleware）：新增 301 redirect 規則，`/login` → `/zh-TW/login`、`/register` → `/zh-TW/register`、`/forgot-password` → `/zh-TW/forgot-password`
- [x] 2.3 修改 `app/sitemap.ts`：移除 `defaultLocale` 特判，`getLocaleUrl` 統一加 `/{locale}` 前綴
- [x] 2.4 修改 `app/[locale]/(auth)/login/page.tsx`：更新 `alternates.languages` 中的 `'zh-TW'` URL 為 `/zh-TW/login`
- [x] 2.5 修改 `app/[locale]/(auth)/register/page.tsx`：同上，更新 `zh-TW` alternate URL
- [x] 2.6 驗證：開發環境訪問 `/login` 應 301 redirect 至 `/zh-TW/login`
- [x] 2.7 ✅ OAuth callback URL：NextAuth 默認 callback 路徑（`/api/auth/callback/*`）已支援所有語系，無需在 provider console 新增前綴版本

## 3. 登出語系保持修復

- [x] 3.1 搜尋所有呼叫 `signOut` 的位置（`grep -r "signOut" components/ app/`）
- [x] 3.2 修改登出 Server Action / 登出按鈕元件：從 next-intl `useLocale()` 取得當前語系，傳入 `signOut({ redirectTo: '/{locale}/login' })`
- [x] 3.3 確認 Sidebar、Navbar、Settings 頁面等所有登出入口均已套用
- [x] 3.4 驗證：以 en 語系登入後登出，確認 redirect 至 `/en/login`

## 4. 行銷 Navbar 元件

- [x] 4.1 建立 `components/landing/LandingNavbar.tsx`（`'use client'`）：包含品牌 Logo、導覽連結（Features / Pricing）、語系切換器、登入連結、立即開始 CTA 按鈕
- [x] 4.2 實作 scroll-aware 樣式切換：`useEffect` 監聽 `window.scrollY`，超過 80px 切換為磨砂玻璃背景（`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md`）
- [x] 4.3 實作行動版漢堡選單：點擊後以 Framer Motion `AnimatePresence` + slide-down 展開全螢幕導覽
- [x] 4.4 使用 `next-intl` `Link` 元件確保語系切換連結正確

## 5. Hero Section

- [x] 5.1 建立 `components/landing/HeroSection.tsx`（`'use client'`）
- [x] 5.2 實作漸層粒子背景：純 CSS `@keyframes` 浮動粒子效果（不依賴 JS 動畫庫，減少 bundle）
- [x] 5.3 實作標題、副標題、CTA 的 Framer Motion `motion.div` 依序 fade-up 進場（`initial: { opacity: 0, y: 30 }` → `animate: { opacity: 1, y: 0 }`，stagger 0.2s）
- [x] 5.4 主要 CTA「立即免費開始」連結至 `/{locale}/register`
- [x] 5.5 次要 CTA「了解功能」以 `onClick` scroll 至 Features Section（`#features`）

## 6. Features Section

- [x] 6.1 建立 `components/landing/FeaturesSection.tsx`（`'use client'`）
- [x] 6.2 實作 8 張功能卡片，每張含 Lucide 圖示、標題、說明文字
- [x] 6.3 使用 Framer Motion `whileInView` + `viewport={{ once: true }}` 實作 scroll-triggered stagger 進場動畫（間隔 0.1s）
- [x] 6.4 實作卡片 hover 3D tilt 效果：`motion.div` + `useMotionValue` + `useTransform` 計算 rotateX / rotateY

## 7. HowItWorks Section

- [x] 7.1 建立 `components/landing/HowItWorksSection.tsx`（`'use client'`）
- [x] 7.2 展示 3 步驟流程：拍照 → AI 辨識 → 記錄完成
- [x] 7.3 步驟之間用 SVG 箭頭連接，以 Framer Motion `pathLength` animate 繪製路徑動畫
- [x] 7.4 使用 `whileInView` 觸發動畫

## 8. Stats Section

- [x] 8.1 建立 `components/landing/StatsSection.tsx`（`'use client'`）
- [x] 8.2 顯示 4 項統計：活躍用戶數、已記錄餐次、辨識食物種類、平均使用滿意度
- [x] 8.3 使用 Framer Motion `useInView` + `useMotionValue` + `animate()` 實作 countup 動畫（2 秒內從 0 計數至目標值）

## 9. Pricing Section（佔位）

- [x] 9.1 建立 `components/landing/PricingSection.tsx`（Server Component）
- [x] 9.2 嘗試呼叫 `/api/pricing/plans` 取得方案資料；若空陣列或失敗，顯示「訂閱方案即將推出」佔位文字
- [x] 9.3 建立 `app/api/pricing/plans/route.ts`：暫時回傳空陣列 `{ success: true, data: [] }`

## 10. Testimonials Section

- [x] 10.1 建立 `components/landing/TestimonialsSection.tsx`（`'use client'`）
- [x] 10.2 以 Framer Motion `AnimatePresence` 實作自動輪播（每 4 秒切換一則），支援手動點擊指示點切換
- [x] 10.3 初始填入 3 則假使用者見證（待真實資料上線後替換）

## 11. Footer Section

- [x] 11.1 建立 `components/landing/FooterSection.tsx`（Server Component）
- [x] 11.2 包含：品牌名稱、版權聲明、隱私權政策連結、服務條款連結、語系選擇器

## 12. LandingPage 整合與路由

- [x] 12.1 建立 `components/landing/LandingPage.tsx`（Server Component）：依序組合 LandingNavbar、HeroSection、FeaturesSection、HowItWorksSection、StatsSection、PricingSection、TestimonialsSection、FooterSection
- [x] 12.2 修改 `app/[locale]/page.tsx`：已登入 → redirect dashboard；未登入 → `return <LandingPage />`
- [x] 12.3 在 `app/[locale]/page.tsx` 的 `generateMetadata` 加入含目標關鍵字的 title、description 及完整 `alternates.canonical` + `alternates.languages`
- [x] 12.4 確認行銷首頁在 `/zh-TW`、`/en`、`/ja` 均可正常訪問並顯示對應語系文案

## 13. Dashboard RSC 邊界重構

- [x] 13.1 建立 `app/[locale]/(dashboard)/dashboard/_client.tsx`（`'use client'`）：接收 `initialData` props，使用 SWR（`useSWR`）做 revalidation，包含所有原有 UI 與互動邏輯
- [x] 13.2 修改 `app/[locale]/(dashboard)/dashboard/page.tsx` 為 Server Component：server-side fetch 初始資料（`NutritionTotals`、`UserGoals`、`WeeklyData`）並以 props 傳入 `_client.tsx`
- [x] 13.3 新增 `generateMetadata`（`{ title: t('metadata.pages.dashboard') }`）於 dashboard `page.tsx`
- [x] 13.4 確認序列化安全：所有傳入 Client Component 的 props 為純 JSON（日期改為 ISO 字串）
- [x] 13.5 驗證 Dashboard 功能與原版一致（今日卡路里、本週趨勢、快速操作）

## 14. 最終驗證

- [x] 14.1 執行 `bun run build` 確認無 TypeScript / build 錯誤
- [ ] 14.2 手動測試：未登入訪問 `/zh-TW` → 顯示行銷首頁
- [ ] 14.3 手動測試：以 en 語系登入後登出 → redirect 至 `/en/login`
- [ ] 14.4 手動測試：訪問 `/login`（舊 URL）→ 301 redirect 至 `/zh-TW/login`
- [ ] 14.5 驗證 `https://localhost:8081/sitemap.xml` 輸出 zh-TW URL 帶 `/zh-TW/` 前綴
- [ ] 14.6 驗證 `https://localhost:8081/robots.txt` 輸出正確 sitemap URL
- [ ] 14.7 行動版（375px）測試行銷首頁 Navbar 漢堡選單開合
- [ ] 14.8 使用 Lighthouse 確認行銷首頁 SEO 分數 ≥ 90
