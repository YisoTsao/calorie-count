## Context

目前 CalorieCount 是一個完整的 SaaS 健康應用，具備 AI 食物掃描、飲食記錄、卡路里追蹤、運動記錄、體重管理、趨勢分析等功能。
所有頁面均在登入牆後方，Google 索引中此網站幾乎不存在。
i18n 使用 next-intl，支援 zh-TW（預設）、en、ja 三個語系，但 `localePrefix: 'as-needed'` 造成 zh-TW 路由無前綴、hreflang 無效。
未來商業模式為訂閱制，但定價尚未確定，需由後台管理。

## Goals / Non-Goals

**Goals:**
- 建立豐富視覺的多語系公開行銷首頁，帶動自然流量
- 修正 `localePrefix` 為 `always`，讓 hreflang 正確運作
- 修復登出後語系被重置的問題
- 重構 Dashboard 頁面符合 RSC 邊界規範
- 訂閱制 Pricing section 佔位（內容由後台動態控制）

**Non-Goals:**
- 實作完整訂閱付款流程（Stripe / 金流整合留待後續）
- 實作後台 Pricing 管理介面
- 部落格 / 食物資訊內容頁

## Decisions

### D1：動畫技術選型 — Framer Motion + CSS Animation（非 Remotion）

**決策：** 行銷首頁互動動畫使用 **Framer Motion**；Remotion 作為參考概念，用於未來產品展示影片（embedded `<video>` 方式）。

**理由：**
- Remotion 設計用途為「在 React 中渲染影片」，不適合作為 Web 頁面的即時互動動畫引擎
- Framer Motion 是 Next.js 生態中主流的頁面動畫方案，與 RSC + Suspense 相容
- 特效清單：scroll-triggered 進場動畫（`whileInView`）、Hero 漸層粒子背景（純 CSS keyframes）、Feature 卡片 3D tilt（`motion.div` + perspective）、Pricing 數字翻轉效果、統計數字 countup、Navbar 磨砂玻璃效果

**替代方案考量：**
- GSAP：功能強大但需付費授權（Business）；不選
- CSS-only：無法做到流暢的 scroll-triggered 進場；不選
- Remotion（直接作為 UI 動畫）：會引入不必要的 bundle 與架構複雜度；不選

---

### D2：`localePrefix: 'always'` 遷移策略

**決策：** 一次性改為 `always`，並在 Next.js middleware（`proxy.ts`）設定 301 redirect：`/login` → `/zh-TW/login`。

**理由：**
- `as-needed` 讓 zh-TW 路由與英文路由 URL 不可區分，hreflang 完全失效
- 一次性遷移比漸進式遷移更簡潔，重新導向成本低
- OAuth provider 的 callback URL 需要同步更新（需手動操作 Google/GitHub/LINE/Facebook console）

**遷移步驟：**
1. 更新 `i18n/routing.ts`
2. 更新 `proxy.ts` / middleware 加入舊路徑 301 redirect
3. 更新所有 `alternates` URL
4. 更新 `sitemap.ts`
5. 提醒開發者在各 OAuth provider 新增 `/zh-TW/` 前綴 callback URL

---

### D3：行銷首頁架構 — Server Component + 條件渲染

**決策：**
```
app/[locale]/page.tsx          ← Server Component，條件式渲染
  ├─ if session → redirect     ← 已登入導向 dashboard
  └─ else → <LandingPage />    ← 未登入顯示行銷首頁
```

**理由：**
- 行銷頁面為靜態內容，適合 Server Component 渲染（SEO 最佳）
- 動畫 Client Components 透過 `'use client'` child 元件處理
- Framer Motion 元件需包裝在 `'use client'` 邊界內，但頁面結構（heading、meta）保持 SSR

**目錄結構：**
```
components/landing/
├─ LandingPage.tsx            ← Server Component，組合各 section
├─ LandingNavbar.tsx          ← 'use client'（語系切換互動）
├─ HeroSection.tsx            ← 'use client'（Framer Motion 動畫）
├─ FeaturesSection.tsx        ← 'use client'（scroll-triggered）
├─ HowItWorksSection.tsx      ← 'use client'（步驟動畫）
├─ StatsSection.tsx           ← 'use client'（countup 數字）
├─ PricingSection.tsx         ← Server Component（靜態佔位，未來 API 取價格）
├─ TestimonialsSection.tsx    ← 'use client'（輪播）
└─ FooterSection.tsx          ← Server Component
```

---

### D4：登出語系保持

**決策：** 登出 Server Action 從當前 URL 解析 locale，redirect 至 `/{locale}/login`。

**理由：**
- 目前登出直接呼叫 `signOut({ redirectTo: '/login' })`，無 locale 資訊
- 正確做法：從 next-intl `getLocale()` 取得當前語系後組合 redirect URL

---

### D5：Dashboard RSC 拆分

**決策：** `dashboard/page.tsx` 保持 Server Component，資料初始載入用 server-side fetch；互動部分抽出至 `dashboard/_client.tsx`（`'use client'`），並改用 SWR 做 client-side revalidation。

**理由：**
- 現狀：整個頁面是 `'use client'` + `useState+useEffect` fetching，違反 copilot-instructions.md 規定
- 改後：符合「優先 Server Components」+「SWR 作 client-side 狀態」規範
- 首次載入資料由 Server 提供（無 client waterfall），後續 SWR 自動 revalidation

## Risks / Trade-offs

- **[OAuth callback URL]** → 改為 `always` 後舊 callback URL `/api/auth/callback/google` 仍有效（NextAuth.js callback 路徑不受 locale prefix 影響），但 post-login redirect 可能需調整
- **[SEO 301 redirect 覆蓋]** → 若部署後有舊版 URL 被 indexed，301 redirect 保護 link equity
- **[Framer Motion bundle 大小]** → 約 +50KB gzipped；透過 dynamic import lazy load 僅在行銷頁面載入，dashboard 不受影響
- **[Dashboard 拆分風險]** → 資料介面（UserGoals、WeeklyData 等 types）需在 server/client 邊界正確 serialize（日期需傳字串而非 Date 物件）

## Migration Plan

1. 先完成 `localePrefix: 'always'` 遷移（BREAKING，需一次部署）
2. 再部署行銷首頁（獨立功能，不影響現有 auth 流程）
3. 登出 locale 修復可與行銷首頁同一個 PR
4. Dashboard 重構獨立 PR，降低風險

## Open Questions

- 行銷首頁是否需要 A/B testing 框架？（暫不納入）
- Pricing section 的「價格由後台管理」—— API 端點格式？（暫定 `/api/pricing/plans` 回傳陣列）
- 是否需要 cookie banner（GDPR）？（台灣市場暫不需要，未來再評估）
