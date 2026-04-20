# 修復核心功能與資料完整性

## Why (為什麼)
目前專案雖已建立基本架構，但多個核心功能存在問題或未完成，影響使用者體驗：

1. **認證流程不完整**：登入、登出、註冊功能需要驗證和修復
2. **資料庫缺少系統資料**：食物資料庫缺少基礎分類、單位等系統資料
3. **前端顯示錯誤**：nutrition 頁面顯示 NaN 和 Invalid Date
4. **體重管理功能異常**：新增體重記錄沒有作用
5. **設定頁面儲存失敗**：個人資料、目標設定無法正確儲存
6. **偏好設定未完成**：部分功能僅有 UI 未實作後端邏輯

這些問題會嚴重影響產品可用性，需要優先修復。

## What Changes (變更內容)

### 1. 認證系統修復
- [ ] 驗證登入流程（Credentials + OAuth）
- [ ] 補充登出 API (`/api/auth/signout`)
- [ ] 確認註冊流程完整性（email 驗證、密碼雜湊）
- [ ] 修復 session 狀態管理

### 2. Prisma Client 設置
- [ ] 確保 `@prisma/client` 正確生成
- [ ] 在 `package.json` 加入必要 scripts
- [ ] 提供 `.env.example` 範本
- [ ] 更新資料庫設置文件

### 3. 食物資料庫系統資料
- [ ] 建立食物分類種子資料 (FoodCategory)
- [ ] 建立單位種子資料 (Unit)
- [ ] 建立常見食物資料
- [ ] 確保資料完整性約束

### 4. 體重管理功能
- [ ] 修復新增體重 API
- [ ] 修正前端表單提交邏輯
- [ ] 確保日期處理正確
- [ ] 驗證 BMI 計算

### 5. 營養追蹤頁面
- [ ] 修復 NaN 顯示問題（加入 defensive checks）
- [ ] 修正 Invalid Date（日期處理標準化）
- [ ] 補充缺少的 API 端點
- [ ] 實作前端資料載入邏輯

### 6. 個人資料更新
- [ ] 修復 `/api/users/me/profile` API
- [ ] 確保表單驗證正確
- [ ] 修正前端狀態更新

### 7. 設定頁面功能
- [ ] 修復目標設定儲存 (`/api/goals`)
- [ ] 修復個人資料儲存 (`/api/profile`)
- [ ] 實作偏好設定後端邏輯
- [ ] 加入錯誤處理與成功提示

### 8. 其他發現的問題
- [ ] 統一 API 錯誤回應格式
- [ ] 加入前端 loading 狀態
- [ ] 改善錯誤訊息顯示
- [ ] 補充必要的 TypeScript 型別定義

## Impact (影響範圍)

### 受影響的規格 (Affected Specs)
- `user-auth/spec.md` - 認證系統
- `database-schema/spec.md` - 資料庫結構
- `api-standards/spec.md` - API 標準

### 受影響的程式碼 (Affected Code)
**後端 API:**
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/signout/route.ts` (新增)
- `app/api/auth/register/route.ts`
- `app/api/goals/route.ts`
- `app/api/users/me/profile/route.ts`
- `app/api/weight/route.ts`
- `app/api/water/route.ts`
- `app/api/exercise/route.ts`

**前端頁面:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(dashboard)/nutrition/page.tsx`
- `app/(dashboard)/weight/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/(dashboard)/profile/page.tsx`

**元件:**
- `components/nutrition/WaterIntakeCard.tsx`
- `components/nutrition/ExerciseLogger.tsx`
- `components/nutrition/WeightTracker.tsx`
- `components/profile/profile-edit-form.tsx`

**資料庫:**
- `prisma/schema.prisma`
- `prisma/seed.ts` (新增或修改)
- `lib/prisma.ts`

**設定檔:**
- `package.json` (scripts)
- `.env.example` (新增)
- `lib/auth.ts`

### Breaking Changes (破壞性變更)
無 - 這些都是錯誤修復和功能補完

## Dependencies (依賴)
- PostgreSQL 資料庫 (本地 Docker 或遠端)
- 已安裝套件：
  - `@prisma/client`
  - `next-auth`
  - `bcryptjs`
  - `zod`

## Risks (風險)
1. **資料庫遷移風險**：執行 migration 可能影響現有資料
   - 緩解：在執行前備份資料庫
   
2. **認證系統變更**：可能影響現有登入用戶
   - 緩解：保持向後相容，測試所有認證流程

3. **API 變更**：前後端需同步更新
   - 緩解：使用版本控制，逐步部署

## Success Criteria (成功標準)

### 1. 認證系統
- ✅ 使用者可以用 email/password 註冊新帳號
- ✅ 使用者可以用 email/password 登入
- ✅ 使用者可以用 Google 登入
- ✅ 使用者可以正確登出
- ✅ Session 狀態正確維護

### 2. 資料庫
- ✅ `prisma generate` 成功執行
- ✅ 資料庫包含必要的系統資料（分類、單位等）
- ✅ 所有外鍵關聯正確

### 3. 體重管理
- ✅ 可以新增體重記錄
- ✅ 體重記錄立即顯示在列表和圖表中
- ✅ 可以編輯和刪除體重記錄
- ✅ BMI 計算正確

### 4. 營養追蹤
- ✅ 所有數值正確顯示（無 NaN）
- ✅ 日期正確顯示（無 Invalid Date）
- ✅ 飲水、運動記錄可以新增
- ✅ 統計數據計算正確

### 5. 個人資料
- ✅ 可以更新個人資料
- ✅ 變更立即反映在 UI 上
- ✅ 重新整理後資料保持

### 6. 設定頁面
- ✅ 目標設定可以儲存
- ✅ 個人資料可以儲存
- ✅ 偏好設定可以儲存並套用

## Implementation Plan (實作計畫)

### Phase 1: 環境與基礎設置 (1 天)
1. 確認 `.env` 設定
2. 建立 `.env.example`
3. 更新 `package.json` scripts
4. 執行 `prisma generate`
5. 驗證資料庫連線

### Phase 2: 認證系統修復 (1.5 天)
1. 檢查並修復登入流程
2. 實作登出 API
3. 驗證註冊流程
4. 測試 OAuth 整合

### Phase 3: 資料庫種子資料 (1 天)
1. 撰寫 seed script
2. 建立系統資料
3. 執行並驗證

### Phase 4: API 修復 (2 天)
1. 修復體重管理 API
2. 修復個人資料 API
3. 修復目標設定 API
4. 實作偏好設定 API

### Phase 5: 前端修復 (2 天)
1. 修復 nutrition 頁面
2. 修復 weight 頁面
3. 修復 settings 頁面
4. 修復 profile 頁面

### Phase 6: 測試與文件 (0.5 天)
1. 整合測試
2. 更新文件
3. 撰寫使用指南

**總計：約 8 個工作天**

## Testing Strategy (測試策略)

### 手動測試清單
- [ ] 註冊新帳號
- [ ] Email/Password 登入
- [ ] Google 登入
- [ ] 登出
- [ ] 新增體重記錄
- [ ] 查看營養追蹤數據
- [ ] 更新個人資料
- [ ] 設定目標
- [ ] 變更偏好設定

### 自動化測試（建議）
- API 端點測試 (Vitest/Jest)
- E2E 測試 (Playwright)
- 資料庫測試

## Documentation Updates (文件更新)
- 更新 `GETTING_STARTED.md`
- 新增 `docs/DATABASE_SETUP.md`
- 更新 `docs/API.md`（如存在）
- 更新 `README.md`

## Rollout Plan (部署計畫)
1. 在開發分支完成所有修復
2. 本地測試通過
3. Code Review
4. 合併到 develop 分支
5. 部署到測試環境
6. QA 測試
7. 部署到生產環境

---

**建議優先級：P0 (最高)**
這些是影響核心功能的關鍵問題，需要優先處理。
