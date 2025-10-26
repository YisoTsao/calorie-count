# Vercel 部署前檢查清單

## ✅ 已完成的修復

### 1. Next.js 16 Params 更新
- [x] `/app/api/recognition/[id]/route.ts` - GET handler
- [x] `/app/api/recognition/[id]/route.ts` - PATCH handler
- [x] `/app/api/recognition/[id]/route.ts` - DELETE handler
- [x] `/app/(dashboard)/scan/result/[id]/page.tsx` - 客戶端頁面

### 2. TypeScript 檢查
- [x] `bunx tsc --noEmit` 無錯誤
- [x] 所有型別正確

### 3. Sharp 依賴問題
- [x] 已移除伺服器端 Sharp 依賴
- [x] 改用客戶端壓縮

---

## 🚀 部署步驟

### 1. 環境變數設定（Vercel Dashboard）

必需設定以下環境變數：

```bash
# Database
DATABASE_URL="your-production-database-url"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-production-secret-min-32-chars"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# OAuth Providers (如果使用)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### 2. Vercel Blob (自動提供)
- Vercel 會自動設定 `BLOB_READ_WRITE_TOKEN`
- 無需手動設定

### 3. 資料庫設定
```bash
# 選項 1: Vercel Postgres (推薦)
# 在 Vercel Dashboard 建立，自動取得 DATABASE_URL

# 選項 2: 外部 PostgreSQL
# 設定 DATABASE_URL 指向你的資料庫
```

### 4. 建置指令檢查
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🧪 本地測試

### 1. 生產建置測試
```bash
# 清理快取
rm -rf .next

# 建置
bun run build

# 預期輸出
# ✓ Compiled successfully
# ✓ Generating static pages
# ✓ Collecting page data
# ✓ Finalizing page optimization
```

### 2. 生產模式運行
```bash
# 啟動生產伺服器
bun start

# 測試
# 訪問 http://localhost:3000
# 測試登入
# 測試上傳功能
# 測試 AI 辨識
```

### 3. TypeScript 檢查
```bash
bunx tsc --noEmit
# 應該無輸出（無錯誤）
```

---

## 📋 部署前確認

### 程式碼檢查
- [ ] 沒有 console.log 洩漏敏感資訊
- [ ] 沒有硬編碼的密鑰
- [ ] .env 檔案在 .gitignore 中
- [ ] 所有 API 路由有正確的錯誤處理
- [ ] 所有動態路由使用 Promise params

### 環境變數檢查
- [ ] `DATABASE_URL` 指向生產資料庫
- [ ] `NEXTAUTH_SECRET` 是隨機且足夠長（≥32字元）
- [ ] `NEXTAUTH_URL` 是正式域名
- [ ] `OPENAI_API_KEY` 有效且有額度
- [ ] `NEXT_PUBLIC_APP_URL` 正確

### 功能檢查
- [ ] 登入/註冊功能正常
- [ ] 圖片上傳功能正常
- [ ] AI 辨識功能正常
- [ ] 個人資料編輯功能正常
- [ ] 所有頁面可正常訪問

---

## 🔧 Vercel 專案設定

### 1. Framework Preset
- **Framework**: Next.js
- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

### 2. Node.js Version
- **推薦**: 20.x
- **最低**: 18.x

### 3. 環境變數分組
```
Production:
  DATABASE_URL
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  OPENAI_API_KEY
  NEXT_PUBLIC_APP_URL

Preview:
  (可以使用相同或測試用的值)

Development:
  (本地 .env 檔案)
```

---

## ⚠️ 常見部署問題

### 問題 1: 資料庫連線失敗
```
Error: Can't reach database server
```
**解決**:
- 確認 DATABASE_URL 正確
- 確認資料庫允許 Vercel IP 連線
- 使用 Vercel Postgres 或支援外部連線的服務

### 問題 2: NextAuth 錯誤
```
[next-auth][error][NO_SECRET]
```
**解決**:
- 設定 `NEXTAUTH_SECRET`
- 使用 `openssl rand -base64 32` 生成

### 問題 3: OpenAI API 錯誤
```
Error: Incorrect API key
```
**解決**:
- 確認 `OPENAI_API_KEY` 正確
- 檢查 API key 有效期限
- 確認帳戶有額度

### 問題 4: 圖片上傳失敗
**生產環境**:
- Vercel Blob 會自動設定
- 確認已啟用 Blob storage

**開發環境**:
- 使用本地檔案系統
- public/uploads 目錄會自動建立

### 問題 5: Middleware Warning
```
⚠ The "middleware" file convention is deprecated
```
**說明**:
- 只是警告，不影響部署
- middleware.ts 仍然正常運作
- 可以繼續使用

---

## 📊 效能優化建議

### 1. 圖片優化
- ✅ 已使用 Next.js Image 組件
- ✅ 客戶端壓縮減少上傳大小
- ✅ WebP 格式節省頻寬

### 2. API 快取
```typescript
// 未來可以加入
export const revalidate = 60; // 60 秒快取
```

### 3. 資料庫查詢優化
```typescript
// 已實作
- 使用 select 限制欄位
- 使用 include 替代多次查詢
- 適當的索引（Prisma schema）
```

---

## 🔍 監控設定

### Vercel Analytics
```bash
# 安裝 (可選)
bun add @vercel/analytics

# app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 錯誤追蹤
- 可整合 Sentry
- 追蹤 API 錯誤率
- 監控 AI 辨識成功率

---

## 🎯 部署指令

### 方式 1: Git 推送（推薦）
```bash
git add .
git commit -m "Fix Next.js 16 params and prepare for deployment"
git push origin main

# Vercel 會自動偵測並部署
```

### 方式 2: Vercel CLI
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel --prod
```

---

## ✅ 部署成功確認

### 1. 建置日誌
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 2. 功能測試
- [ ] 訪問首頁
- [ ] 測試登入
- [ ] 測試註冊
- [ ] 上傳圖片
- [ ] AI 辨識
- [ ] 編輯結果
- [ ] 儲存記錄

### 3. 效能檢查
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.0s

---

## 📱 生產環境 URLs

### 預設 Vercel URL
```
https://your-project.vercel.app
```

### 自訂域名（可選）
```
https://your-domain.com
```

在 Vercel Dashboard → Settings → Domains 設定

---

## 🆘 緊急回滾

如果部署後發現問題：

### Vercel Dashboard
1. 前往 Deployments
2. 找到上一個穩定版本
3. 點擊 "Promote to Production"

### Git 回滾
```bash
git revert HEAD
git push origin main
```

---

## 📚 部署後待辦

- [ ] 設定自訂域名
- [ ] 啟用 Analytics
- [ ] 設定錯誤追蹤
- [ ] 配置 CDN 快取
- [ ] 設定備份策略
- [ ] 文檔更新（README）
- [ ] 使用者測試

---

**準備狀態**: ✅ 可以部署  
**預估部署時間**: 2-5 分鐘  
**信心指數**: 95%

祝部署順利！🚀
