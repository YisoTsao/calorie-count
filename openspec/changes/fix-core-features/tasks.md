# 任務清單 - 修復核心功能

## Phase 1: 環境與基礎設置

### 1.1 Prisma 設置
- [ ] 確認 `@prisma/client` 已安裝
- [ ] 執行 `prisma generate` 驗證 client 生成
- [ ] 在 `package.json` 新增以下 scripts:
  ```json
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts",
  "postinstall": "prisma generate"
  ```
- [ ] 檢查 `lib/prisma.ts` 設定正確

### 1.2 環境變數設置
- [ ] 建立 `.env.example` 包含：
  - `DATABASE_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `OPENAI_API_KEY`
  - `BLOB_READ_WRITE_TOKEN`
- [ ] 驗證 `.env` 所有必要變數已設定
- [ ] 測試資料庫連線

### 1.3 文件更新
- [ ] 建立 `docs/DATABASE_SETUP.md` 說明：
  - 如何啟動 PostgreSQL (Docker)
  - 如何執行 migrations
  - 如何執行 seed
- [ ] 更新 `GETTING_STARTED.md` 加入資料庫設置步驟

---

## Phase 2: 認證系統修復

### 2.1 登入功能
- [ ] 檢查 `lib/auth.ts` 的 NextAuth 設定
- [ ] 驗證 Credentials Provider 邏輯
- [ ] 測試 email/password 登入流程
- [ ] 確認 JWT token 包含 user.id
- [ ] 測試 session 正確建立

### 2.2 登出功能
- [ ] 建立 `app/api/auth/signout/route.ts`
- [ ] 實作清除 NextAuth cookies 邏輯
- [ ] 更新前端登出按鈕指向正確的 API
- [ ] 測試登出後 session 清除

### 2.3 註冊功能
- [ ] 檢查 `app/api/auth/register/route.ts`
- [ ] 驗證 email 唯一性檢查
- [ ] 確認密碼雜湊 (bcrypt)
- [ ] 測試註冊流程
- [ ] 驗證新用戶寫入資料庫

### 2.4 OAuth 整合
- [ ] 測試 Google 登入流程
- [ ] 確認 OAuth callback 正確處理
- [ ] 驗證新用戶自動建立 profile

---

## Phase 3: 資料庫種子資料

### 3.1 種子腳本撰寫
- [ ] 建立 `prisma/seed.ts`
- [ ] 或修改現有 seed 檔案

### 3.2 系統資料建立
- [ ] **FoodCategory** - 食物分類
  - 主食類
  - 蔬菜類
  - 水果類
  - 肉類
  - 海鮮類
  - 豆類
  - 乳製品
  - 油脂類
  - 飲料類
  - 其他

- [ ] **Unit** - 單位
  - 克 (g)
  - 公斤 (kg)
  - 毫升 (ml)
  - 公升 (L)
  - 份
  - 碗
  - 杯
  - 個
  - 片
  - 湯匙
  - 茶匙

- [ ] **常見食物** (至少 50 種)
  - 白飯、麵條、麵包等主食
  - 常見蔬菜和水果
  - 常見肉類和海鮮
  - 常見飲料和零食
  - 包含完整營養資訊

### 3.3 執行與驗證
- [ ] 執行 `bun run db:seed`
- [ ] 使用 Prisma Studio 檢查資料
- [ ] 驗證資料完整性和關聯

---

## Phase 4: API 修復

### 4.1 體重管理 API
- [ ] 檢查 `app/api/weight/route.ts`
- [ ] 修復 POST 新增邏輯
  - 驗證 input (weight, date, bodyFat, notes)
  - 計算 BMI (需要 user.profile.height)
  - 正確儲存到資料庫
- [ ] 修復 GET 查詢邏輯
  - 支援日期範圍篩選
  - 正確排序和分頁
- [ ] 修復 PUT 更新邏輯
- [ ] 修復 DELETE 刪除邏輯
- [ ] 測試所有端點

### 4.2 個人資料 API
- [ ] 檢查 `app/api/users/me/profile/route.ts`
- [ ] 修復 GET 邏輯
  - 正確回傳 profile 資料
- [ ] 修復 PUT/PATCH 更新邏輯
  - 驗證 input (name, height, weight, age, gender)
  - 更新 UserProfile
  - 正確回傳更新後的資料
- [ ] 加入錯誤處理
- [ ] 測試 API

### 4.3 目標設定 API
- [ ] 檢查 `app/api/goals/route.ts`
- [ ] 修復 GET 邏輯
- [ ] 修復 PUT 更新邏輯
  - 驗證 input (dailyCalorieGoal, proteinGoal, etc.)
  - 更新 UserGoals
  - 處理初次建立 vs 更新的情況
- [ ] 測試 API

### 4.4 偏好設定 API
- [ ] 建立或檢查 `app/api/preferences/route.ts`
- [ ] 實作 GET 邏輯
- [ ] 實作 PUT 更新邏輯
  - theme, language, units
  - notification preferences
- [ ] 測試 API

### 4.5 飲水記錄 API
- [ ] 檢查 `app/api/water/route.ts`
- [ ] 確保 CRUD 操作正確
- [ ] 測試 API

### 4.6 運動記錄 API
- [ ] 檢查 `app/api/exercise/route.ts`
- [ ] 確保 CRUD 操作正確
- [ ] 實作卡路里消耗計算
- [ ] 測試 API

---

## Phase 5: 前端修復

### 5.1 Nutrition 頁面
- [ ] 檢查 `app/nutrition/page.tsx`
- [ ] 修復元件 import 路徑
- [ ] 實作 `WaterIntakeCard` 元件
  - 載入今日飲水記錄
  - 新增飲水功能
  - 顯示進度條
  - 處理 NaN (加入 fallback 值)
- [ ] 實作 `ExerciseLogger` 元件
  - 載入今日運動記錄
  - 新增運動功能
  - 顯示卡路里消耗
  - 處理 NaN
- [ ] 實作 `WeightTracker` 元件
  - 載入最新體重
  - 顯示趨勢圖
  - 處理 NaN
- [ ] 修復日期處理
  - 統一使用 `new Date()` 並加入 validation
  - 格式化顯示使用 `toLocaleDateString()`
  - 加入 `isValid()` 檢查
- [ ] 測試所有功能

### 5.2 Weight 頁面
- [ ] 檢查 `app/(dashboard)/weight/page.tsx`
- [ ] 修復新增體重表單
  - 確認 API endpoint 正確
  - 驗證 input
  - 成功後重新載入資料
  - 顯示成功/錯誤訊息
- [ ] 修復列表顯示
  - 處理空陣列情況
  - 正確格式化日期
  - 正確顯示數值 (避免 NaN)
- [ ] 修復編輯功能
- [ ] 修復刪除功能
- [ ] 測試所有功能

### 5.3 Settings 頁面
- [ ] 檢查 `app/(dashboard)/settings/page.tsx`
- [ ] 修復個人資料 tab
  - 載入資料
  - 儲存邏輯
  - 成功提示
  - 錯誤處理
- [ ] 修復目標設定 tab
  - 載入資料
  - 儲存邏輯
  - 驗證 input
- [ ] 修復偏好設定 tab
  - 實作儲存邏輯（連接到後端 API）
  - 主題切換功能
  - 語言切換功能
  - 通知設定儲存
- [ ] 測試所有 tabs

### 5.4 Profile 頁面
- [ ] 檢查 `app/(dashboard)/profile/page.tsx`
- [ ] 修復編輯表單 `components/profile/profile-edit-form.tsx`
  - 載入目前資料
  - 表單驗證
  - 提交邏輯
  - 成功後導向回 profile 頁面
- [ ] 測試更新流程

### 5.5 登入/註冊頁面
- [ ] 檢查 `app/(auth)/login/page.tsx`
- [ ] 檢查 `components/auth/login-form.tsx`
  - 測試表單提交
  - 錯誤訊息顯示
  - 成功後導向
- [ ] 檢查 `app/(auth)/register/page.tsx`
- [ ] 檢查 `components/auth/register-form.tsx`
  - 測試註冊流程
  - 密碼強度驗證
  - Email 格式驗證

---

## Phase 6: 測試與驗證

### 6.1 手動測試
- [ ] **認證流程**
  - 註冊新帳號
  - Email/Password 登入
  - Google 登入
  - 登出
  
- [ ] **體重管理**
  - 新增體重記錄
  - 查看列表和圖表
  - 編輯記錄
  - 刪除記錄
  
- [ ] **營養追蹤**
  - 新增飲水記錄
  - 新增運動記錄
  - 查看統計數據
  - 確認無 NaN 或 Invalid Date
  
- [ ] **個人資料**
  - 更新個人資料
  - 驗證資料保存
  - 重新整理後檢查
  
- [ ] **設定頁面**
  - 設定目標
  - 變更偏好設定
  - 驗證儲存成功

### 6.2 資料完整性檢查
- [ ] 使用 Prisma Studio 檢查：
  - FoodCategory 表有資料
  - Unit 表有資料
  - Food 表有足夠的食物資料
  - 所有外鍵關聯正確

### 6.3 錯誤處理檢查
- [ ] 所有 API 有適當的錯誤訊息
- [ ] 前端有 loading 狀態
- [ ] 前端有錯誤提示

---

## Phase 7: 文件與部署準備

### 7.1 文件更新
- [ ] 更新 `README.md`
  - 專案簡介
  - 安裝步驟
  - 環境變數說明
  - 執行指令
- [ ] 完成 `docs/DATABASE_SETUP.md`
- [ ] 更新 `GETTING_STARTED.md`
- [ ] 撰寫 `docs/API.md` (可選)

### 7.2 Code Review
- [ ] 檢查程式碼品質
- [ ] 移除 console.log
- [ ] 確認 TypeScript 沒有錯誤
- [ ] 執行 ESLint

### 7.3 部署準備
- [ ] 確認 `.env.example` 完整
- [ ] 準備 production 環境變數
- [ ] 測試 build (`bun run build`)
- [ ] 準備部署文件

---

## 檢查清單總結

完成以上所有任務後，應該達成：
- ✅ 使用者可以註冊、登入、登出
- ✅ 資料庫有完整的系統資料
- ✅ 體重管理功能正常運作
- ✅ 營養追蹤頁面正確顯示數據
- ✅ 個人資料可以更新
- ✅ 設定頁面所有功能可用
- ✅ 無 NaN 或 Invalid Date 錯誤
- ✅ 所有 API 有適當的錯誤處理
- ✅ 文件完整且易於理解
