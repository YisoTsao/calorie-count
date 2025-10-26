# 實作任務清單

## 1. 環境設定與套件安裝
- [x] 1.1 安裝 Prisma 相關套件 (`prisma`, `@prisma/client`)
- [x] 1.2 安裝 NextAuth.js (`next-auth`)
- [x] 1.3 安裝表單驗證套件 (`zod`, `react-hook-form`, `@hookform/resolvers`)
- [x] 1.4 安裝 UI 相關套件 (shadcn/ui 初始化)
- [x] 1.5 設定環境變數檔案 (`.env`, `.env.example`)
- [x] 1.6 配置 TypeScript 路徑別名 (`tsconfig.json`)

## 2. 資料庫設計與設定
- [x] 2.1 建立 `prisma/schema.prisma` 檔案
- [x] 2.2 定義 User 模型 (id, email, name, password, profile 欄位)
- [x] 2.3 定義 Account 模型 (OAuth 帳號關聯)
- [x] 2.4 定義 Session 模型 (會話管理)
- [x] 2.5 定義 VerificationToken 模型 (Email 驗證)
- [x] 2.6 定義 UserProfile 模型 (身高、體重、目標等)
- [x] 2.7 定義 UserGoals 模型 (每日目標)
- [x] 2.8 定義 UserPreferences 模型 (偏好設定)
- [x] 2.9 執行 `prisma generate` 生成 Prisma Client
- [x] 2.10 執行 `prisma migrate dev` 建立資料庫

## 3. 認證系統實作
- [x] 3.1 建立 `lib/auth.ts` 設定 NextAuth
- [x] 3.2 實作 Email Provider (密碼認證)
- [x] 3.3 整合 Google OAuth Provider
- [x] 3.4 整合 Apple OAuth Provider (可選)
- [x] 3.5 建立 `app/api/auth/[...nextauth]/route.ts`
- [x] 3.6 實作密碼加密 (bcrypt)
- [x] 3.7 建立會話管理邏輯
- [x] 3.8 實作 JWT token 策略

## 4. 共用程式庫建立
- [x] 4.1 建立 `lib/prisma.ts` (Prisma Client 單例模式)
- [x] 4.2 建立 `lib/api-response.ts` (統一 API 回應格式)
- [x] 4.3 建立 `lib/errors.ts` (自訂錯誤類別)
- [x] 4.4 建立 `lib/utils.ts` (工具函數)
- [x] 4.5 建立 `lib/validations/auth.ts` (認證相關 Zod schemas)

## 5. API 路由實作
- [x] 5.1 建立 `app/api/auth/register/route.ts` (註冊 API)
- [x] 5.2 建立 `app/api/auth/verify-email/route.ts` (Email 驗證)
- [x] 5.3 建立 `app/api/users/me/route.ts` (取得當前使用者資料)
- [x] 5.4 建立 `app/api/users/me/profile/route.ts` (更新個人資料)
- [x] 5.5 實作 API 錯誤處理中間件

## 6. TypeScript 型別定義
- [x] 6.1 建立 `types/api.ts` (API 回應型別)
- [x] 6.2 建立 `types/auth.ts` (認證相關型別)
- [x] 6.3 建立 `types/user.ts` (使用者型別)
- [x] 6.4 建立 `types/database.ts` (資料庫型別擴展)

## 7. UI 元件庫建立
- [x] 7.1 初始化 shadcn/ui (`npx shadcn-ui@latest init`)
- [x] 7.2 安裝基礎元件 (Button, Input, Card, Form)
- [x] 7.3 建立 `components/ui/loading.tsx` (載入元件)
- [x] 7.4 建立 `components/ui/error-message.tsx` (錯誤訊息元件)
- [x] 7.5 建立 `components/auth/login-form.tsx` (登入表單)
- [x] 7.6 建立 `components/auth/register-form.tsx` (註冊表單)
- [x] 7.7 配置 Tailwind 主題色彩

## 8. 認證頁面實作
- [x] 8.1 建立 `app/(auth)/login/page.tsx` (登入頁面)
- [x] 8.2 建立 `app/(auth)/register/page.tsx` (註冊頁面)
- [x] 8.3 建立 `app/(auth)/verify-email/page.tsx` (Email 驗證頁面)
- [x] 8.4 建立 `app/(auth)/forgot-password/page.tsx` (忘記密碼頁面)
- [x] 8.5 建立 `app/(auth)/layout.tsx` (認證頁面 Layout)

## 9. 儀表板基礎框架
- [x] 9.1 建立 `app/(dashboard)/layout.tsx` (儀表板 Layout)
- [x] 9.2 建立 `app/(dashboard)/page.tsx` (首頁/儀表板)
- [x] 9.3 建立 `components/layout/navbar.tsx` (導航列)
- [x] 9.4 建立 `components/layout/sidebar.tsx` (側邊欄)
- [x] 9.5 實作受保護路由邏輯 (middleware)

## 10. 測試與驗證
- [x] 10.1 測試註冊流程
- [x] 10.2 測試 Email 登入
- [x] 10.3 測試 Google OAuth 登入
- [x] 10.4 測試登出功能
- [x] 10.5 驗證所有 TypeScript 型別無錯誤
- [x] 10.6 確認資料庫關聯正確
- [x] 10.7 測試 API 錯誤處理
- [x] 10.8 檢查 UI 在不同裝置的響應式設計

## 11. 文件撰寫
- [x] 11.1 撰寫 README.md 環境設定說明
- [x] 11.2 記錄環境變數說明 (.env.example)
- [x] 11.3 撰寫資料庫遷移指南
- [x] 11.4 記錄認證流程文件

## 實作順序建議
1. 先完成 **1-4** (環境與基礎設定)
2. 再做 **5-6** (API 與型別)
3. 然後 **7-8** (UI 與認證頁面)
4. 接著 **9** (儀表板框架)
5. 最後 **10-11** (測試與文件)

## 預估時間
- 總計: 約 2-3 個工作天
- 核心功能: 1.5 天
- UI/UX 調整: 0.5 天
- 測試與文件: 0.5-1 天
