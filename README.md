# CalorieCount - AI 卡路里追蹤應用

一個功能完整的 AI 驅動飲食追蹤平台，結合食物識別、營養分析、運動記錄和健康目標管理。

## ✨ 核心功能

- 🤖 **AI 食物識別**: 拍照自動識別食物、計算卡路里與營養成分
- 📊 **完整飲食追蹤**: 記錄早餐、午餐、晚餐、零食，實時營養摘要
- 🏃 **運動記錄**: 14 種運動類型，自動計算消耗熱量
- 📈 **數據分析**: 趨勢圖表、周報、營養分布可視化
- 🎯 **智能目標**: 自動推薦卡路里/巨量營養素目標
- 🏆 **成就系統**: 解鎖成就徽章，激勵健康習慣養成
- 🔐 **多渠道登入**: Email/密碼、Google、Facebook、LINE
- 🌍 **多語言**: 繁體中文、English、日本語（i18n 完整支持）
- 📧 **多語系郵件**: 驗證、密碼重設郵件按使用者語言自動發送
- 👤 **個人資料管理**: 身高、體重、出生日期、性別設定
- 🎨 **現代 UI**: 深色模式支持，響應式設計

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| **前端框架** | Next.js 16.0 (App Router) + TypeScript |
| **樣式** | Tailwind CSS + Styled Components |
| **UI 元件庫** | shadcn/ui + Radix UI |
| **國際化** | next-intl (3 語言) |
| **狀態管理** | Zustand (客戶端) + SWR (伺服器狀態) |
| **表單驗證** | React Hook Form + Zod |
| **後端** | Next.js API Routes + Route Handlers |
| **資料庫** | PostgreSQL 16 + Prisma ORM |
| **認證** | NextAuth.js v5 (Email/OAuth) |
| **郵件服務** | Resend (多語言 HTML 模板) |
| **AI/Vision** | OpenAI Vision API |
| **動畫** | Framer Motion |
| **包管理** | Bun |
| **部署** | Vercel (自動 CI/CD) |
| **資料庫託管** | Vercel PostgreSQL |

## 📋 環境需求

- **Node.js 18+** 或 **Bun**
- **PostgreSQL 16** (本地開發用 Docker)
- **OpenAI API Key** (食物識別功能)
- **Resend API Key** (郵件發送功能)

## 🚀 快速開始

### 1. 複製專案

```bash
git clone <repository-url>
cd calorie-count
```

### 2. 安裝依賴

```bash
bun install
```

### 3. 設定環境變數

```bash
cp .env.example .env.local
```

必填變數：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/calorie_count"
DIRECT_URL="postgresql://user:password@localhost:5432/calorie_count"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# OAuth (可選)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 郵件服務
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# AI 服務
OPENAI_API_KEY="your-openai-api-key"

# 域名設定
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 啟動資料庫

```bash
# 使用 Docker (推薦)
./scripts/db.sh start

# 或手動啟動 PostgreSQL
```

### 5. 資料庫初始化

```bash
# 生成 Prisma Client
bun prisma generate

# 執行遷移
bun prisma migrate dev

# (可選) 植入初始資料
bun prisma db seed
```

### 6. 啟動開發伺服器

```bash
bun dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
calorie-count/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── [locale]/                 # 動態語言路由
│   │   ├── layout.tsx            # 語言布局 (next-intl 提供)
│   │   ├── page.tsx              # 首頁 / Landing
│   │   ├── (auth)/               # 認證路由組 (非登入使用者)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/          # 儀表板路由組 (需登入)
│   │   │   ├── page.tsx          # 首頁/概覽
│   │   │   ├── scan/             # AI 食物掃描
│   │   │   ├── meals/            # 飲食日誌
│   │   │   ├── exercise/         # 運動記錄
│   │   │   ├── nutrition/        # 營養分析
│   │   │   ├── goals/            # 目標設定
│   │   │   ├── profile/          # 個人資料
│   │   │   └── achievements/     # 成就系統
│   │   └── (static)/             # 靜態頁面
│   │       ├── privacy/          # 隱私政策 (三語言)
│   │       └── terms/            # 服務條款 (三語言)
│   └── api/                      # API Routes
│       ├── auth/                 # 認證端點
│       ├── meals/                # 飲食端點
│       ├── achievements/         # 成就端點
│       └── ...
├── components/
│   ├── ui/                       # shadcn/ui 基礎元件
│   ├── auth/                     # 登入、註冊、重設表單
│   ├── dashboard/                # 儀表板特定元件
│   ├── meals/                    # 飲食相關元件
│   ├── nutrition/                # 營養分析元件
│   ├── landing/                  # Landing page 元件
│   └── layout/                   # 導覽欄、側邊欄
├── lib/
│   ├── auth.ts                   # NextAuth 設定
│   ├── auth.config.ts            # 授權提供者設定
│   ├── email.ts                  # Resend 多語言郵件服務
│   ├── prisma.ts                 # Prisma Client 單例
│   ├── nutrition-calculator.ts   # 營養計算邏輯
│   ├── api-response.ts           # API 標準回應格式
│   ├── validations/              # Zod schemas
│   └── achievements/             # 成就計算邏輯
├── prisma/
│   ├── schema.prisma             # 資料庫 schema
│   └── migrations/               # 資料庫遷移紀錄
├── types/
│   ├── api.ts                    # API 型別
│   ├── auth.ts                   # 認證型別
│   ├── database.ts               # 資料庫型別
│   └── index.ts                  # 共用型別
├── messages/                     # i18n 翻譯文件
│   ├── zh-TW.json               # 繁體中文
│   ├── en.json                  # 英文
│   └── ja.json                  # 日文
├── i18n/                        # next-intl 設定
│   ├── routing.ts               # 路由設定
│   ├── request.ts               # 請求處理
│   └── navigation.ts            # 導航 Link
├── docs/                        # 專案文檔
│   ├── GETTING_STARTED.md       # 開始指南
│   ├── DATABASE.md              # 資料庫文檔
│   ├── CONTRIBUTING.md          # 貢獻指南
│   ├── DEPLOYMENT_CHECKLIST.md  # 部署檢查清單
│   └── design/                  # 設計資產
├── openspec/                    # OpenSpec 開發規格
│   ├── config.yaml             # 規格設定
│   ├── changes/                # 進行中的變更
│   ├── specs/                  # 完成的規格
│   └── archive/                # 已存檔的變更
├── scripts/
│   └── db.sh                   # PostgreSQL 管理腳本
├── public/                     # 靜態資產
│   ├── opengraph-image.png    # OG 預覽圖
│   └── uploads/               # 使用者上傳文件
├── .env.example               # 環境變數範本
├── next.config.ts             # Next.js 設定
├── tailwind.config.ts         # Tailwind 設定
├── tsconfig.json              # TypeScript 設定
├── eslint.config.mjs          # ESLint 設定
└── package.json               # 依賴與指令
```

## 🗄️ 資料庫管理

使用 `db.sh` 腳本管理 PostgreSQL:

```bash
./scripts/db.sh start     # 啟動容器
./scripts/db.sh stop      # 停止容器
./scripts/db.sh status    # 查看狀態
./scripts/db.sh logs      # 查看日誌
./scripts/db.sh psql      # 進入 psql 終端
./scripts/db.sh clean     # 刪除資料 (危險!)
```

## 📦 主要指令

```bash
# 開發
bun dev                    # 啟動開發伺服器 (http://localhost:3000)
bun build                  # 生產建置
bun start                  # 啟動生產伺服器

# 資料庫
bun prisma generate       # 重新生成 Prisma Client
bun prisma migrate dev    # 建立和執行遷移
bun prisma studio        # 開啟 Prisma Studio (GUI)
bun prisma db push       # 推送 schema 到資料庫 (危險!)
bun db:seed             # 植入初始資料

# 程式碼品質
bun run lint             # ESLint 檢查
bun run type-check       # TypeScript 型別檢查
bun run format           # 自動格式化 (Prettier)

# 其他
bun run clean            # 清除快取和編譯檔案
```

## 🌍 多語言支持

使用 **next-intl** 實現三語言支持：

- **繁體中文** (`zh-TW`) - 預設語言
- **English** (`en`)
- **日本語** (`ja`)

語言切換會自動更新 URL 路由和 Cookie 設定。郵件服務會根據使用者語言自動發送對應語言的內容。

## 🔐 認證流程

### 註冊流程
1. 使用者填寫 Email、密碼、姓名
2. 系統發送 HTML 驗證郵件 (依用戶語言)
3. 使用者點擊郵件中的連結驗證 Email
4. 驗證成功後可登入

### 密碼重設
1. 使用者在登入頁點擊「忘記密碼？」
2. 輸入 Email，系統發送重設連結
3. 使用者點擊郵件連結進入重設頁面
4. 輸入新密碼完成重設

### OAuth 登入
支持 Google、Facebook、LINE 快速登入（需設定對應的 OAuth 認證憑證）

## 🚀 部署

### Vercel 部署 (推薦)

```bash
# 1. 推送至 GitHub
git push origin main

# 2. 在 Vercel 連結專案
# 3. 設定環境變數
# 4. 自動部署
```