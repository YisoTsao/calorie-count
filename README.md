# CalorieCount - AI 卡路里識別系統

一個使用 AI 技術識別食物並追蹤卡路里攝取的完整 Web 應用程式。

## ✨ 主要功能

- 🤖 **AI 食物識別**: 使用 OpenAI Vision API 自動識別食物並計算營養成分
- 📊 **飲食記錄**: 完整的每日飲食記錄與營養追蹤
- 📈 **數據分析**: 視覺化圖表展示飲食趨勢與健康數據
- 🎯 **目標管理**: 設定個人健康目標並追蹤進度
- 🏆 **成就系統**: 激勵使用者持續記錄的成就徽章
- 🔐 **安全認證**: Email/密碼 + Google OAuth 登入

## 🛠️ 技術棧

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16
- **Authentication**: NextAuth.js v5
- **UI Components**: shadcn/ui + Radix UI
- **AI**: OpenAI Vision API
- **Package Manager**: Bun

## 📋 環境需求

- Node.js 18+ 或 Bun
- PostgreSQL 16 (建議使用 Docker)
- OpenAI API Key (用於食物識別功能)

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

複製 `.env.example` 並重新命名為 `.env`:

```bash
cp .env.example .env
```

填寫必要的環境變數:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calorie_count"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/calorie_count"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # 使用 openssl rand -base64 32 生成

# Google OAuth (可選)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (Phase 3 需要)
OPENAI_API_KEY="your-openai-api-key"
```

### 4. 啟動資料庫

使用 Docker 啟動 PostgreSQL:

```bash
./scripts/db.sh start
```

或使用 Docker Compose:

```bash
docker-compose up -d
```

### 5. 執行資料庫遷移

```bash
bun prisma generate
bun prisma migrate dev
```

### 6. 啟動開發伺服器

```bash
bun dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
calorie-count/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認證相關頁面 (登入、註冊)
│   ├── (dashboard)/         # 儀表板頁面 (需登入)
│   └── api/                 # API Routes
├── components/              # React 元件
│   ├── ui/                  # shadcn/ui 基礎元件
│   ├── auth/                # 認證相關元件
│   └── layout/              # 布局元件 (Navbar, Sidebar)
├── lib/                     # 共用函式庫
│   ├── auth.ts              # NextAuth 設定
│   ├── prisma.ts            # Prisma Client
│   ├── api-response.ts      # API 回應格式
│   └── validations/         # Zod 驗證 schemas
├── prisma/                  # Prisma 設定
│   └── schema.prisma        # 資料庫 schema
├── types/                   # TypeScript 型別定義
├── docs/                    # 專案文件
├── openspec/                # OpenSpec 開發規格
│   ├── changes/             # 進行中的變更
│   └── archive/             # 已完成的變更
└── scripts/                 # 工具腳本
    └── db.sh                # 資料庫管理腳本
```

## 🗄️ 資料庫管理

使用提供的腳本管理 PostgreSQL:

```bash
# 啟動資料庫
./scripts/db.sh start

# 停止資料庫
./scripts/db.sh stop

# 查看狀態
./scripts/db.sh status

# 查看日誌
./scripts/db.sh logs

# 進入 psql
./scripts/db.sh psql

# 清除資料 (危險!)
./scripts/db.sh clean
```

詳細說明請參考 [docs/DATABASE.md](docs/DATABASE.md)

## 🧪 測試

```bash
# 型別檢查
bun run type-check

# Linting
bun run lint

# 執行測試 (未來實作)
bun test
```

測試清單請參考 [docs/TESTING.md](docs/TESTING.md)

## 📚 開發文件

- [資料庫文件](docs/DATABASE.md)
- [測試文件](docs/TESTING.md)
- [OpenSpec 開發指南](openspec/OPENSPEC_GUIDE.md)

## 🔐 認證流程

1. **Email/密碼註冊**
   - 訪問 `/register`
   - 填寫 name, email, password
   - 自動登入並重定向到 dashboard

2. **Email/密碼登入**
   - 訪問 `/login`
   - 輸入 email 和 password
   - 登入成功重定向到 dashboard

3. **Google OAuth**
   - 點擊 "使用 Google 登入"
   - 完成 OAuth 授權
   - 自動建立或關聯帳號

## 📦 可用指令

```bash
# 開發
bun dev              # 啟動開發伺服器
bun build            # 建置生產版本
bun start            # 啟動生產伺服器

# 資料庫
bun prisma generate  # 生成 Prisma Client
bun prisma migrate dev  # 執行遷移 (開發)
bun prisma studio    # 開啟 Prisma Studio
bun prisma db push   # 推送 schema 到資料庫

# 程式碼品質
bun run lint         # ESLint 檢查
bun run type-check   # TypeScript 型別檢查
```

## 🚧 開發路線圖

- [x] Phase 1: 專案基礎架構 (完成度: 100%)
- [ ] Phase 2: 使用者管理
- [ ] Phase 3: AI 食物識別
- [ ] Phase 4: 飲食記錄
- [ ] Phase 5: 營養追蹤
- [ ] Phase 6: 數據分析
- [ ] Phase 7: 食物資料庫
- [ ] Phase 8: 社交功能 (選配)
- [ ] Phase 9: 優化與部署

詳細規劃請參考 [openspec/OPENSPEC_GUIDE.md](openspec/OPENSPEC_GUIDE.md)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request!

## 📄 授權

MIT License

## 👥 作者

CalorieCount Development Team

---

**注意**: 本專案目前處於開發階段,部分功能尚未實作。
