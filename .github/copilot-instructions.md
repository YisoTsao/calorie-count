# GitHub Copilot Instructions

> 本檔案為 **最高優先級規則來源（Single Source of Truth）**
> Copilot 在每次生成內容前，**必須先套用以下 Skills 規則，再進行推理與產出**

## 必要規則（每次回應均須遵守）

### 語言

- 所有回應、程式碼註解、Commit 訊息 → **繁體中文（台灣正體）**

### 套件管理

- 只能用 `bun`（禁止 npm / yarn / pnpm）

### 技術堆疊

| 用途       | 工具                                                    |
| ---------- | ------------------------------------------------------- |
| 頁面路由   | Next.js 16+ app Router                                |
| 樣式       | Tailwind CSS + Styled Components                        |
| 客戶端狀態 | Zustand                                                 |
| 伺服器狀態 | **SWR**（禁止 useState + useEffect 呼叫 API）           |
| 表單       | **React Hook Form + Zod**（禁止 useState 管理表單欄位） |


---

# 🔥 強制 Skills（每次回應必須套用）

## 1. Karpathy Guidelines（Coding 行為準則）

### Think Before Coding

* 不可假設需求，需明確說出 assumptions
* 若有多種解法，需列出 trade-offs，不可默選
* 若需求不清楚，需先指出問題再實作

---

### Simplicity First

* 只寫「剛好解決問題」的最小程式碼
* 禁止：

  * 預先設計（over-engineering）
  * 未要求的抽象化
  * 未要求的 extensibility
* 若 200 行可縮到 50 行 → 必須縮

---

### Surgical Changes

* 只修改「與需求直接相關」的程式碼
* 禁止：

  * 順手重構
  * 修改無關 code
* 若產生 dead code → 只清理自己造成的

---

### Goal-Driven Execution

所有任務需轉為「可驗證目標」

範例：

* ❌ 修 bug
* ✅ 寫測試重現 bug → 修正 → 測試通過

多步驟任務需附：

1. Step → verify
2. Step → verify
3. Step → verify

---

## 2. Next.js Best Practices（架構與實作準則）

### Rendering Strategy

* 優先 Server Components
* 僅在需要互動時使用 Client Components
* 禁止不必要的 client-side fetching

---

### Data Fetching

* Server side：

  * 使用 Server Components / Route Handlers
* Client side：

  * 使用 **SWR**
* 避免：

  * data waterfall（需 parallel / Suspense） ([Skills][1])

---

### File & Routing Conventions

* 遵守 Next.js 檔案約定（page / layout / route）
* 正確使用：

  * dynamic routes
  * route groups
  * parallel routes

---

### RSC Boundaries

* 禁止：

  * 在 Client Component 使用 server-only API
  * 傳遞 non-serializable props

---

### Performance Optimization

* 圖片 → 必須使用 `next/image`
* 字體 → 使用 `next/font`
* 避免大 bundle / 不必要 dependency

---

### Error Handling

* 必須使用：

  * `error.tsx`
  * `not-found.tsx`
* 避免 try/catch 吞錯誤

---

### Metadata & SEO

* 使用 `generateMetadata`
* 正確設定 OG / meta

---

# ⚠️ 執行流程（強制）

每次回應必須遵守：

1. 理解需求 + 明確 assumptions
2. 套用 Karpathy（避免 over-engineering）
3. 套用 Next.js best practices
4. 產出最小可行解
5. 確保結果可驗證

---

# ❗ 強制約束（非常重要）

如果產出違反以上規則：

* 必須自動修正後再輸出
* 不可直接輸出錯誤實作

---

# 🧠 行為準則總結（簡化版）

* 不猜（Explicit assumptions）
* 不多寫（Minimal code）
* 不亂改（Surgical change）
* 可驗證（Testable outcome）
* 符合 Next.js 架構（RSC / Data / Routing）

---

# 📁 專案概覽（Project Context）

> AI 卡路里追蹤平台。詳見 [README.md](../README.md) 與 [docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md)

## 常用指令

```bash
bun dev              # 本地開發（http://localhost:3000）
bun build            # 生產建置
bun db:push          # 同步 schema（本地）
bun db:migrate       # 新增 migration
bun db:studio        # 開啟 Prisma Studio
bun db:seed          # 初始化種子資料
bun lint             # ESLint 檢查
bun format           # Prettier 格式化
```

## 目錄結構

```
app/
  (admin)/           # ADMIN role 專用頁面（layout 含 RBAC 檢查）
  (auth)/            # 公開認證頁面（login / register / verify）
  (dashboard)/       # 登入後主功能頁面
  [locale]/          # i18n 根路由（zh-TW / en / ja）
  api/               # Route Handlers（13 個資源：meals, foods, exercise...）
components/          # 依功能分類（admin/ auth/ dashboard/ meals/ ui/...）
lib/
  auth.ts            # NextAuth 主設定（PrismaAdapter + providers）
  auth.config.ts     # Edge-compatible 設定（公開路由白名單）
  api-response.ts    # 標準回應 helpers（createSuccessResponse / createErrorResponse）
  rbac.ts            # 角色權限控制（UserRole: USER / SUPPORT / EDITOR / ADMIN）
  prisma.ts          # Prisma client singleton
prisma/schema.prisma # 資料庫 schema（主要模型：User, Meal, Food, Exercise...）
i18n/routing.ts      # 語系設定（locales: zh-TW, en, ja；prefix: always）
messages/            # 翻譯檔（zh-TW.json / en.json / ja.json）
types/               # 全域型別定義
```

## 命名慣例

| 類型 | 格式 | 範例 |
|------|------|------|
| 元件檔案 | `PascalCase.tsx` | `NutritionCard.tsx` |
| 其他檔案 | `kebab-case.ts` | `api-response.ts` |
| 元件函式 | `PascalCase` | `function MealCard()` |
| 工具函式 | `camelCase` | `createSuccessResponse()` |
| import alias | `@/` | `import { auth } from '@/lib/auth'` |

## API Route 模式

```typescript
// app/api/meals/route.ts 範例
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return createErrorResponse('Unauthorized', 401)

  const data = await prisma.meal.findMany({ where: { userId: session.user.id } })
  return createSuccessResponse(data)
}
```

## Auth 使用模式

```typescript
// Server Component / Route Handler
import { auth } from '@/lib/auth'
const session = await auth()

// Client Component（取得 session）
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
```

## i18n 模式

```typescript
// Server Component
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')

// Client Component
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')

// 新增翻譯：同時更新 messages/zh-TW.json、en.json、ja.json
```

## 參考文件

- [docs/DATABASE.md](../docs/DATABASE.md) — 資料庫 schema 說明
- [docs/ERROR_HANDLING_GUIDE.md](../docs/ERROR_HANDLING_GUIDE.md) — 錯誤處理規範
- [docs/DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) — 部署流程
- [docs/QUICK_REFERENCE.md](../docs/QUICK_REFERENCE.md) — 常用指令速查
- [openspec/project.md](../openspec/project.md) — 專案規格與架構決策

