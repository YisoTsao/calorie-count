## 1. 基礎架構設定

- [ ] 1.1 安裝 `next-intl` 依賴
- [ ] 1.2 建立 i18n 配置檔 (`src/i18n/config.ts`)：定義支援語言列表、預設語言
- [ ] 1.3 建立 `src/i18n/request.ts`：next-intl Server Components 整合
- [ ] 1.4 建立翻譯訊息檔 `messages/zh-TW.json`（從現有硬編碼文字提取）
- [ ] 1.5 建立翻譯訊息檔 `messages/en.json`（英文翻譯）
- [ ] 1.6 建立翻譯訊息檔 `messages/ja.json`（日文翻譯）

## 2. Next.js 路由結構調整

- [ ] 2.1 更新 `middleware.ts`：整合 `next-intl/middleware` 語言偵測與重導向
- [ ] 2.2 建立 `app/[locale]/layout.tsx`：包裹 `NextIntlClientProvider`
- [ ] 2.3 遷移 `app/layout.tsx` 至 `app/[locale]/layout.tsx`
- [ ] 2.4 遷移 `app/page.tsx` 至 `app/[locale]/page.tsx`
- [ ] 2.5 遷移 `app/(auth)/` 路由群組至 `app/[locale]/(auth)/`
- [ ] 2.6 遷移 `app/(dashboard)/` 路由群組至 `app/[locale]/(dashboard)/`
- [ ] 2.7 遷移 `app/nutrition/` 至 `app/[locale]/nutrition/`
- [ ] 2.8 確認 `app/api/` 路由不受影響（API 路由不需要 locale prefix）

## 3. 共用元件國際化

- [ ] 3.1 國際化 `components/layout/navbar.tsx`（導航項目、使用者選單）
- [ ] 3.2 國際化 `components/layout/sidebar.tsx`（側邊欄選單項目）
- [ ] 3.3 建立語言切換器元件 `components/ui/LocaleSwitcher.tsx`
- [ ] 3.4 將語言切換器加入 Navbar
- [ ] 3.5 國際化通用 UI 元件中的固定文字（按鈕文字、空狀態提示等）

## 4. 頁面國際化 — 認證模組

- [ ] 4.1 國際化 `login/page.tsx`（登入頁面）
- [ ] 4.2 國際化 `register/page.tsx`（註冊頁面）
- [ ] 4.3 國際化 `forgot-password/page.tsx`
- [ ] 4.4 國際化 `verify-email/page.tsx`
- [ ] 4.5 國際化 `components/auth/login-form.tsx`
- [ ] 4.6 國際化 `components/auth/register-form.tsx`

## 5. 頁面國際化 — Dashboard 模組

- [ ] 5.1 國際化 `dashboard/page.tsx`（首頁儀表板）
- [ ] 5.2 國際化 `meals/page.tsx`（飲食記錄）
- [ ] 5.3 國際化 `scan/page.tsx`（食物掃描）
- [ ] 5.4 國際化 `foods/page.tsx`（食物資料庫）
- [ ] 5.5 國際化 `exercise/page.tsx`（運動記錄）
- [ ] 5.6 國際化 `weight/page.tsx`（體重管理）
- [ ] 5.7 國際化 `goals/page.tsx`（目標設定）
- [ ] 5.8 國際化 `analytics/page.tsx`（數據分析）
- [ ] 5.9 國際化 `profile/page.tsx`（個人資料）
- [ ] 5.10 國際化 `settings/page.tsx`（設定）
- [ ] 5.11 國際化 `achievements/page.tsx`（成就）
- [ ] 5.12 國際化 `reports/page.tsx`（報告）
- [ ] 5.13 國際化 `nutrition/page.tsx`（營養追蹤）

## 6. Dashboard 元件國際化

- [ ] 6.1 國際化 `components/dashboard/NutritionSummaryCard.tsx`
- [ ] 6.2 國際化 `components/analytics/` 下的元件
- [ ] 6.3 國際化 `components/meals/` 下的元件
- [ ] 6.4 國際化 `components/scan/` 下的元件
- [ ] 6.5 國際化 `components/profile/` 下的元件
- [ ] 6.6 國際化 `components/nutrition/` 下的元件

## 7. API 錯誤訊息國際化

- [ ] 7.1 建立 API 錯誤訊息翻譯對應表
- [ ] 7.2 更新 `lib/errors.ts` 支援多語言錯誤碼
- [ ] 7.3 更新 `lib/api-response.ts` 加入 locale 感知
- [ ] 7.4 更新各 API route handler 使用翻譯後的錯誤訊息

## 8. 使用者偏好持久化

- [ ] 8.1 Prisma schema 新增 `preferredLocale` 欄位至 User model
- [ ] 8.2 建立並執行資料庫 migration
- [ ] 8.3 更新 `api/preferences` 端點支援語言偏好的讀取與更新
- [ ] 8.4 Middleware 中讀取使用者偏好並設定 locale
- [ ] 8.5 語言切換時同步更新 cookie 與資料庫偏好

## 9. SEO 與 Metadata

- [ ] 9.1 各頁面 `metadata` 根據 locale 動態設定 `title` 和 `description`
- [ ] 9.2 根 layout 設定 `<html lang={locale}>`
- [ ] 9.3 加入 `hreflang` alternate links
- [ ] 9.4 更新 `sitemap.xml` 支援多語言 URL

## 10. 日期與數字格式化

- [ ] 10.1 建立 locale-aware 日期格式化工具 (`lib/date-format.ts`)
- [ ] 10.2 建立 locale-aware 數字格式化工具 (`lib/number-format.ts`)
- [ ] 10.3 替換所有 `toLocaleDateString('zh-TW', ...)` 為動態 locale 格式化

## 11. 測試與驗證

- [ ] 11.1 驗證所有頁面在 zh-TW 下正常顯示
- [ ] 11.2 驗證所有頁面在 en 下正常顯示
- [ ] 11.3 驗證所有頁面在 ja 下正常顯示
- [ ] 11.4 驗證語言切換功能正常運作
- [ ] 11.5 驗證語言偏好持久化正常運作
- [ ] 11.6 驗證 SEO metadata 正確輸出
- [ ] 11.7 驗證 API 錯誤訊息按語言回傳
