# 測試清單

本文件記錄 init-project-foundation 階段的所有測試項目與結果。

## 10.1 註冊流程測試

### 測試項目
- [ ] 使用有效 email 和密碼註冊
- [ ] 密碼驗證 (最少 8 字元)
- [ ] Email 格式驗證
- [ ] 重複 email 註冊錯誤處理
- [ ] 註冊成功後自動登入

### 測試步驟
1. 訪問 `/register`
2. 填寫表單: name, email, password
3. 提交表單
4. 驗證 API 回應
5. 確認重定向到 dashboard

### 預期結果
- ✅ 註冊成功返回 201 狀態碼
- ✅ 使用者資料正確儲存到資料庫
- ✅ 自動登入並重定向

---

## 10.2 Email 登入測試

### 測試項目
- [ ] 使用正確的 email 和密碼登入
- [ ] 錯誤密碼處理
- [ ] 不存在的 email 處理
- [ ] 登入成功後 session 建立
- [ ] 記住我功能 (可選)

### 測試步驟
1. 訪問 `/login`
2. 輸入 email 和 password
3. 點擊登入按鈕
4. 驗證 session 建立
5. 確認重定向到 dashboard

### 預期結果
- ✅ 登入成功重定向到 `/dashboard`
- ✅ Session cookie 正確設置
- ✅ 錯誤憑證顯示適當錯誤訊息

---

## 10.3 Google OAuth 登入測試

### 測試項目
- [ ] Google 登入按鈕正常運作
- [ ] OAuth 流程完整
- [ ] 首次登入自動建立帳號
- [ ] 已存在帳號正確關聯
- [ ] 登入後取得使用者資訊

### 測試步驟
1. 訪問 `/login`
2. 點擊 "使用 Google 登入"
3. 完成 Google OAuth 授權
4. 驗證帳號建立或關聯
5. 確認重定向

### 預期結果
- ✅ OAuth 流程無錯誤
- ✅ 使用者資料正確儲存
- ✅ 成功重定向到 dashboard

### 注意事項
⚠️ 需要在 Google Cloud Console 設定:
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

---

## 10.4 登出功能測試

### 測試項目
- [ ] 點擊登出按鈕
- [ ] Session 正確清除
- [ ] Cookie 移除
- [ ] 重定向到登入頁

### 測試步驟
1. 在已登入狀態
2. 點擊登出按鈕
3. 驗證 session 清除
4. 嘗試訪問受保護路由

### 預期結果
- ✅ 成功登出
- ✅ 重定向到 `/login`
- ✅ 無法訪問 dashboard (自動重定向)

---

## 10.5 TypeScript 型別檢查

### 測試項目
- [ ] 執行 `bun run type-check`
- [ ] 所有檔案無型別錯誤
- [ ] API 回應型別正確
- [ ] Prisma 生成型別正確

### 測試指令
```bash
bun run type-check
# 或
npx tsc --noEmit
```

### 預期結果
- ✅ 無 TypeScript 錯誤
- ✅ 所有 import 正確解析

---

## 10.6 資料庫關聯驗證

### 測試項目
- [ ] User → UserProfile 關聯
- [ ] User → UserGoals 關聯
- [ ] User → UserPreferences 關聯
- [ ] User → Account 關聯
- [ ] User → Session 關聯
- [ ] Cascade delete 正確運作

### 測試方法
1. 使用 Prisma Studio 查看資料
2. 建立測試資料驗證關聯
3. 刪除使用者驗證 cascade

### 測試指令
```bash
bun prisma studio
```

### 預期結果
- ✅ 所有關聯正確建立
- ✅ Foreign keys 正確設定
- ✅ Cascade delete 運作正常

---

## 10.7 API 錯誤處理測試

### 測試項目
- [ ] 400 Bad Request (驗證錯誤)
- [ ] 401 Unauthorized (未登入)
- [ ] 403 Forbidden (權限不足)
- [ ] 404 Not Found (資源不存在)
- [ ] 500 Internal Server Error (伺服器錯誤)
- [ ] Prisma 錯誤正確映射

### 測試 API Endpoints
```bash
# 測試驗證錯誤
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'

# 測試未授權
curl http://localhost:3000/api/users/me

# 測試不存在的資源
curl http://localhost:3000/api/users/non-existent-id
```

### 預期結果
- ✅ 錯誤格式統一 (使用 ApiResponse)
- ✅ 適當的 HTTP 狀態碼
- ✅ 有意義的錯誤訊息

---

## 10.8 響應式設計測試

### 測試裝置
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 測試頁面
- [ ] 登入頁面
- [ ] 註冊頁面
- [ ] Dashboard
- [ ] Navbar
- [ ] Sidebar

### 測試工具
- Chrome DevTools (Device Toolbar)
- Firefox Responsive Design Mode
- 實際裝置測試

### 預期結果
- ✅ 所有裝置正常顯示
- ✅ 按鈕和表單易於點擊
- ✅ Navbar 在手機上使用 hamburger menu
- ✅ Sidebar 在手機上可收合
- ✅ 文字大小適中可讀

---

## 測試總結

### 自動化測試 (未來實作)
- [ ] 使用 Vitest 進行單元測試
- [ ] 使用 Playwright 進行 E2E 測試
- [ ] API 整合測試

### 手動測試結果
執行日期: _待執行_

| 測試項目 | 狀態 | 備註 |
|---------|------|------|
| 10.1 註冊流程 | ⬜ |  |
| 10.2 Email 登入 | ⬜ |  |
| 10.3 Google OAuth | ⬜ |  |
| 10.4 登出功能 | ⬜ |  |
| 10.5 TypeScript 型別 | ⬜ |  |
| 10.6 資料庫關聯 | ⬜ |  |
| 10.7 API 錯誤處理 | ⬜ |  |
| 10.8 響應式設計 | ⬜ |  |

### 已知問題
- 無

### 待修復
- 無
