## ADDED Requirements

### Requirement: 未登入使用者看到行銷首頁
當使用者未登入訪問根路由 `/`（或 `/en`、`/ja`）時，系統 SHALL 顯示行銷首頁，而非 redirect 至登入頁。

#### Scenario: 未登入訪問根路由
- **WHEN** 未登入使用者訪問 `/`、`/en`、`/ja`
- **THEN** 顯示完整的行銷首頁（Hero + Features + HowItWorks + Stats + Pricing + Testimonials + Footer）

#### Scenario: 已登入訪問根路由
- **WHEN** 已登入使用者訪問 `/`（或 `/en`、`/ja`）
- **THEN** 系統 SHALL 自動 redirect 至 `/{locale}/dashboard`，不顯示行銷頁

### Requirement: 行銷首頁包含 Hero Section
系統 SHALL 在首頁頂部顯示 Hero Section，包含主標題、副標題、主要 CTA 按鈕（「立即免費開始」→ 連結至 register）及次要 CTA（「觀看功能」→ scroll 至 Features）。

#### Scenario: Hero Section 動畫進場
- **WHEN** 頁面載入完成
- **THEN** 標題、副標題、CTA 依序以 Framer Motion fade-up 動畫進場

#### Scenario: Hero Section CTA 點擊
- **WHEN** 使用者點擊「立即免費開始」
- **THEN** 跳轉至當前語系的 register 頁面（`/{locale}/register`）

### Requirement: 行銷首頁包含功能展示 Section
系統 SHALL 展示以下核心功能，每項附圖示、標題、說明文字，並在 scroll 進入視口時以 Framer Motion 動畫呈現：
1. AI 食物辨識（拍照即計算卡路里）
2. 完整營養追蹤（蛋白質、碳水、脂肪）
3. 飲食記錄（早午晚餐 + 點心）
4. 運動記錄（消耗熱量追蹤）
5. 體重管理（趨勢圖表）
6. 趨勢分析（週 / 月報表）
7. 目標設定（個人化卡路里目標）
8. 成就系統（健康里程碑解鎖）

#### Scenario: Features scroll 進場
- **WHEN** 使用者 scroll 至 Features Section
- **THEN** 每張功能卡片依序從下方滑入（stagger 效果，間隔 0.1s）

### Requirement: 行銷首頁包含 Pricing Section（佔位）
系統 SHALL 顯示訂閱制 Pricing Section，方案資料從後端 API `/api/pricing/plans` 動態取得。若 API 尚未實作，顯示「即將推出」佔位文字。

#### Scenario: API 尚未就緒時
- **WHEN** `/api/pricing/plans` 回傳空陣列或 404
- **THEN** 顯示「訂閱方案即將推出，敬請期待」佔位文字，不顯示錯誤

#### Scenario: API 回傳方案資料時
- **WHEN** `/api/pricing/plans` 回傳方案陣列
- **THEN** 依據資料動態渲染各訂閱方案卡片

### Requirement: 行銷首頁包含統計數字 Section
系統 SHALL 顯示產品數據統計（使用者數、記錄飲食次數、辨識食物數等），數字以 countup 動畫呈現（scroll 進入視口時觸發）。

#### Scenario: 統計數字 countup
- **WHEN** 使用者 scroll 至 Stats Section
- **THEN** 數字從 0 開始計數至目標值，動畫時長 2 秒

### Requirement: 行銷首頁支援多語系
所有行銷首頁文案 SHALL 透過 next-intl 的 `useTranslations` / `getTranslations` 取得，並在 `messages/zh-TW.json`、`messages/en.json`、`messages/ja.json` 中新增對應的 `landing` namespace。

#### Scenario: 語系切換
- **WHEN** 使用者在 Navbar 切換語系
- **THEN** 整個行銷首頁文案立即切換，不重新載入頁面（next-intl 客戶端切換）

### Requirement: 行銷首頁具備正確的 SEO metadata
系統 SHALL 在 `app/[locale]/page.tsx` 的 `generateMetadata` 中輸出包含目標關鍵字的 title、description，以及完整的 `alternates.canonical` 和 `alternates.languages`（hreflang）。

#### Scenario: zh-TW 語系 metadata
- **WHEN** Google 爬取 `/zh-TW`
- **THEN** 回傳 `<title>CalorieCount | AI 卡路里計算 · 飲食追蹤</title>` 及 hreflang 指向所有語系

#### Scenario: en 語系 metadata
- **WHEN** Google 爬取 `/en`
- **THEN** 回傳 `<title>CalorieCount | AI Calorie Counter & Food Tracker</title>` 及 hreflang 指向所有語系
