# 開發指南

歡迎加入 CalorieCount 開發!本文件將幫助你快速上手專案開發。

## 📋 目錄

- [環境設定](#環境設定)
- [專案結構](#專案結構)
- [開發流程](#開發流程)
- [程式碼規範](#程式碼規範)
- [API 開發](#api-開發)
- [資料庫操作](#資料庫操作)
- [常見問題](#常見問題)

## 環境設定

### 1. 安裝依賴

```bash
# 使用 Bun (推薦)
bun install

# 或使用 npm/yarn/pnpm
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入必要資訊:

```bash
cp .env.example .env
```

必填項目:
- `DATABASE_URL`: PostgreSQL 連線字串
- `NEXTAUTH_SECRET`: 使用 `openssl rand -base64 32` 生成

### 3. 啟動資料庫

```bash
./scripts/db.sh start
```

### 4. 執行資料庫遷移

```bash
bun prisma generate
bun prisma migrate dev
```

### 5. 啟動開發伺服器

```bash
bun dev
```

## 專案結構

```
calorie-count/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認證頁面群組
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # 儀表板頁面群組 (需登入)
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── ...
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   └── users/
│   └── layout.tsx           # 根 Layout
├── components/              # React 元件
│   ├── ui/                  # shadcn/ui 基礎元件
│   ├── auth/                # 認證相關元件
│   └── layout/              # 布局元件
├── lib/                     # 共用函式庫
│   ├── auth.ts              # NextAuth 設定
│   ├── prisma.ts            # Prisma Client
│   ├── api-response.ts      # 統一 API 回應格式
│   ├── errors.ts            # 自訂錯誤類別
│   ├── utils.ts             # 工具函數
│   └── validations/         # Zod 驗證 schemas
├── prisma/                  # Prisma 設定
│   ├── schema.prisma        # 資料庫 schema
│   └── migrations/          # 遷移檔案
├── types/                   # TypeScript 型別定義
│   ├── api.ts
│   ├── auth.ts
│   └── user.ts
└── openspec/                # OpenSpec 開發規格
    ├── OPENSPEC_GUIDE.md
    ├── changes/             # 進行中的變更
    └── archive/             # 已完成的變更
```

## 開發流程

### 使用 OpenSpec 方法論

1. **查看當前 Phase**
   ```bash
   cat openspec/OPENSPEC_GUIDE.md
   ```

2. **閱讀變更提案**
   ```bash
   cat openspec/changes/<change-name>/proposal.md
   ```

3. **查看任務清單**
   ```bash
   cat openspec/changes/<change-name>/tasks.md
   ```

4. **實作功能**
   - 按照任務清單順序實作
   - 勾選完成的任務

5. **測試驗證**
   - 手動測試功能
   - 執行型別檢查: `bun run type-check`
   - 執行 linting: `bun run lint`

6. **歸檔變更**
   ```bash
   openspec archive <change-name> --yes
   ```

### Git 工作流程

```bash
# 1. 建立功能分支
git checkout -b feature/<feature-name>

# 2. 開發並提交
git add .
git commit -m "feat: implement <feature>"

# 3. 推送到遠端
git push origin feature/<feature-name>

# 4. 建立 Pull Request
```

### Commit 訊息規範

使用 [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` 新功能
- `fix:` 修復 bug
- `docs:` 文件更新
- `style:` 程式碼格式 (不影響功能)
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 雜項 (建置、工具等)

範例:
```
feat: add user profile management API
fix: resolve authentication token expiry issue
docs: update README with installation steps
```

## 程式碼規範

### TypeScript

- ✅ 使用 strict mode
- ✅ 明確定義型別,避免 `any`
- ✅ 使用型別推論 (適當時)
- ✅ 匯出共用型別到 `types/` 目錄

### React

- ✅ 使用 Functional Components
- ✅ 善用 Server Components (預設)
- ✅ Client Components 加上 `'use client'`
- ✅ 元件檔案使用 PascalCase
- ✅ Props 使用 interface 定義

### 命名規範

- **檔案**: kebab-case (`user-profile.tsx`)
- **元件**: PascalCase (`UserProfile`)
- **函數**: camelCase (`getUserProfile`)
- **常數**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **型別/介面**: PascalCase (`UserProfile`)

### 目錄結構

```typescript
// ✅ Good
components/
  ├── auth/
  │   ├── login-form.tsx
  │   └── register-form.tsx
  └── layout/
      ├── navbar.tsx
      └── sidebar.tsx

// ❌ Bad
components/
  ├── LoginForm.tsx
  ├── RegisterForm.tsx
  ├── Navbar.tsx
  └── Sidebar.tsx
```

## API 開發

### API 路由結構

```
app/api/
├── auth/
│   ├── register/route.ts
│   └── verify-email/route.ts
├── users/
│   ├── me/route.ts
│   └── [id]/route.ts
└── foods/
    ├── route.ts
    └── [id]/route.ts
```

### API 回應格式

使用統一的 `ApiResponse`:

```typescript
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const data = await fetchData();
    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error('Failed to fetch data', 500);
  }
}
```

### 錯誤處理

```typescript
import { ApiError } from '@/lib/errors';

// 拋出錯誤
throw new ApiError('User not found', 404);

// 捕捉 Prisma 錯誤
try {
  await prisma.user.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new ApiError('Email already exists', 409);
  }
  throw error;
}
```

### 驗證

使用 Zod schemas:

```typescript
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  const body = await req.json();
  
  // 驗證
  const validated = registerSchema.parse(body);
  
  // 處理...
}
```

## 資料庫操作

### Prisma 常用指令

```bash
# 生成 Prisma Client
bun prisma generate

# 建立遷移
bun prisma migrate dev --name <migration-name>

# 重設資料庫 (危險!)
bun prisma migrate reset

# 推送 schema 變更 (開發用)
bun prisma db push

# 開啟 Prisma Studio
bun prisma studio

# 查看遷移狀態
bun prisma migrate status
```

### 修改 Schema

1. 編輯 `prisma/schema.prisma`
2. 執行遷移:
   ```bash
   bun prisma migrate dev --name add_new_field
   ```
3. 更新 TypeScript 型別:
   ```bash
   bun prisma generate
   ```

### 查詢最佳實踐

```typescript
// ✅ 使用 select 減少資料傳輸
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ✅ 使用 include 載入關聯
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    profile: true,
    goals: true,
  },
});

// ❌ 避免 N+1 查詢
for (const user of users) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
}

// ✅ 使用 include 一次載入
const users = await prisma.user.findMany({
  include: { profile: true },
});
```

## UI 元件開發

### 使用 shadcn/ui

```bash
# 新增元件
bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add card

# 查看可用元件
bunx shadcn@latest add
```

### 元件範例

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## 測試

### 手動測試

參考 `docs/TESTING.md` 的測試清單

### 型別檢查

```bash
bun run type-check
```

### Linting

```bash
bun run lint
bun run lint --fix  # 自動修復
```

## 常見問題

### Q: Prisma Client 沒有最新 schema?

```bash
bun prisma generate
```

### Q: 資料庫連線失敗?

```bash
# 檢查資料庫是否啟動
./scripts/db.sh status

# 啟動資料庫
./scripts/db.sh start

# 查看日誌
./scripts/db.sh logs
```

### Q: TypeScript 錯誤?

```bash
# 重新安裝依賴
rm -rf node_modules
bun install

# 重新生成 Prisma Client
bun prisma generate

# 檢查型別
bun run type-check
```

### Q: shadcn 元件安裝失敗?

手動建立元件檔案或檢查 `components.json` 設定。

### Q: NextAuth session 無法取得?

確認:
1. `NEXTAUTH_SECRET` 已設定
2. `NEXTAUTH_URL` 正確
3. Cookie 沒有被阻擋

## 開發工具推薦

- **IDE**: VS Code
- **擴充套件**:
  - Prisma
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitLens
- **資料庫工具**: Prisma Studio, TablePlus, pgAdmin
- **API 測試**: Postman, Insomnia, Thunder Client

## 其他資源

- [Next.js 文件](https://nextjs.org/docs)
- [Prisma 文件](https://www.prisma.io/docs)
- [NextAuth.js 文件](https://next-auth.js.org)
- [shadcn/ui 文件](https://ui.shadcn.com)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)

## 需要幫助?

- 查看 `docs/` 目錄下的文件
- 查看 `openspec/` 中的規格
- 提交 Issue 到 GitHub

祝開發愉快! 🚀
