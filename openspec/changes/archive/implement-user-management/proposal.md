# 變更提案: 實作會員管理功能

## 📋 變更資訊
- **變更名稱**: implement-user-management
- **建立日期**: 2025-10-25
- **預估時間**: 2 天
- **優先級**: High
- **依賴**: init-project-foundation (已完成)

## 🎯 為什麼要做這個變更?

### 背景
在完成基礎認證系統後,使用者需要一個完整的會員中心來管理個人資料、設定目標、調整偏好設定。這是使用者體驗的核心部分,直接影響使用者的留存率和滿意度。

### 問題
目前系統雖然有完整的資料庫架構 (UserProfile, UserGoals, UserPreferences),但缺乏對應的 UI 介面讓使用者進行管理:
- 使用者註冊後無法完善個人資料 (身高、體重、年齡等)
- 無法設定或調整每日營養目標 (卡路里、蛋白質等)
- 無法更改應用程式偏好 (主題、語言、通知設定)
- 缺乏密碼修改和帳號安全功能
- 沒有帳號刪除機制

### 價值
- **提升使用者體驗**: 完整的個人化設定讓使用者感受到產品的專業性
- **提高資料完整度**: 收集使用者的身體數據以便後續提供精準的營養建議
- **增加黏著度**: 讓使用者投入時間設定個人資料,提高留存率
- **為 AI 功能鋪路**: 完整的使用者資料是 AI 個人化建議的基礎

## 📦 這個變更會做什麼?

### 主要功能模組

#### 1. 會員中心首頁
- 顯示使用者基本資訊摘要
- 快速訪問各項設定
- 顯示帳號統計數據 (註冊天數、記錄天數等)

#### 2. 個人資料編輯
- 編輯姓名、Email
- 上傳/更換頭像
- 設定生日、性別
- 記錄身高、目前體重
- 設定目標體重
- 選擇活動量級別

#### 3. 目標設定
- 選擇目標類型 (減重/增重/維持)
- 設定每日卡路里目標
- 自訂營養素目標 (蛋白質、碳水、脂肪)
- 設定水分攝取目標
- 設定目標達成日期

#### 4. 偏好設定
- 切換主題 (淺色/深色/自動)
- 選擇語言 (繁中/簡中/英文)
- 選擇單位系統 (公制/英制)
- 通知偏好設定
  - 用餐提醒
  - 喝水提醒
  - 目標提醒
  - 社群更新
- 隱私設定
  - 個人檔案可見度
  - 是否顯示體重
  - 是否顯示進度

#### 5. 安全設定
- 修改密碼
- 查看登入裝置記錄
- 雙重驗證設定 (可選)
- 帳號刪除

### 技術實作

#### 新增 API Endpoints
- `PATCH /api/users/me` - 更新基本資料
- `PATCH /api/users/me/profile` - 更新個人資料、目標、偏好
- `POST /api/users/me/avatar` - 上傳頭像
- `PATCH /api/users/me/password` - 修改密碼
- `DELETE /api/users/me` - 刪除帳號

#### 新增頁面
- `/dashboard/profile` - 會員中心首頁
- `/dashboard/profile/edit` - 編輯個人資料
- `/dashboard/profile/goals` - 目標設定
- `/dashboard/profile/preferences` - 偏好設定
- `/dashboard/profile/security` - 安全設定

#### 新增元件
- `ProfileCard` - 個人資料卡片
- `AvatarUpload` - 頭像上傳元件
- `GoalSettingForm` - 目標設定表單
- `PreferencesForm` - 偏好設定表單
- `PasswordChangeForm` - 密碼修改表單
- `DangerZone` - 危險操作區域

## 🎨 影響範圍

### 新增檔案
- `openspec/changes/implement-user-management/specs/user-profile-management/spec.md`
- `app/(dashboard)/profile/page.tsx`
- `app/(dashboard)/profile/edit/page.tsx`
- `app/(dashboard)/profile/goals/page.tsx`
- `app/(dashboard)/profile/preferences/page.tsx`
- `app/(dashboard)/profile/security/page.tsx`
- `app/api/users/me/avatar/route.ts`
- `app/api/users/me/password/route.ts`
- `components/profile/*.tsx` (多個元件)
- `lib/validations/profile.ts`
- `lib/image-upload.ts`

### 修改檔案
- `app/api/users/me/profile/route.ts` (擴展功能)
- `types/user.ts` (新增型別)
- `lib/validations/auth.ts` (新增密碼驗證)

### 影響的模組
- 認證系統 (密碼修改)
- 資料庫 (UserProfile, UserGoals, UserPreferences)
- 儀表板 Layout (新增導航連結)

## ✅ 成功標準

### 功能完整性
- [ ] 使用者可以編輯所有個人資料欄位
- [ ] 頭像上傳功能正常運作 (支援圖片壓縮)
- [ ] 目標設定可以正確儲存和更新
- [ ] 偏好設定即時生效 (如主題切換)
- [ ] 密碼修改功能安全可靠
- [ ] 帳號刪除需要二次確認且完全移除資料

### 使用者體驗
- [ ] 所有表單都有適當的驗證和錯誤提示
- [ ] 更新成功後有明確的回饋訊息
- [ ] 頁面載入速度快,無明顯延遲
- [ ] 響應式設計在手機、平板、桌面都正常

### 技術品質
- [ ] 所有 API 都有完整的錯誤處理
- [ ] 使用 TypeScript 嚴格型別檢查
- [ ] 表單使用 react-hook-form + zod 驗證
- [ ] 敏感操作 (密碼修改、帳號刪除) 需要重新驗證
- [ ] 圖片上傳有大小限制和格式檢查

### 安全性
- [ ] 密碼修改需要輸入舊密碼
- [ ] 帳號刪除需要輸入密碼確認
- [ ] 所有 API 都經過身份驗證
- [ ] 敏感資料不在前端暴露

## 🔄 後續步驟

完成此變更後,下一步將進入 **Phase 3: AI 食物辨識**,實作核心的圖片辨識功能。

## 📝 備註

- 頭像上傳可以先使用 Cloudinary 或 Vercel Blob Storage
- 主題切換需要與 Tailwind CSS dark mode 整合
- 帳號刪除應該是軟刪除 (標記為已刪除) 而非硬刪除
- 考慮加入「匯出我的資料」功能 (GDPR 合規)
