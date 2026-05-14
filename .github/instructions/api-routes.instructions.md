---
applyTo: "app/api/**"
---

# API Route 規範

## 必要結構

```typescript
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: Request) {
  // 1. 驗證身份
  const session = await auth()
  if (!session?.user?.id) return createErrorResponse('Unauthorized', 401)

  // 2. 驗證輸入（query params 用 Zod）
  const { searchParams } = new URL(req.url)

  // 3. 查詢資料（永遠帶 userId 過濾）
  const data = await prisma.meal.findMany({ where: { userId: session.user.id } })

  // 4. 回傳標準格式
  return createSuccessResponse(data)
}
```

## 規則

- 所有 Route 必須先呼叫 `auth()` 驗證
- 使用 `createSuccessResponse` / `createErrorResponse`（勿直接 `return Response.json()`）
- 用 Zod 驗證所有輸入（body / query params）
- 資料查詢必須帶 `userId` 過濾，防止越權存取
- 管理員功能需額外檢查 `session.user.role === 'ADMIN'`（參考 [lib/rbac.ts](../../lib/rbac.ts)）

## 標準回應格式

```typescript
// 成功
createSuccessResponse(data, 200)
// { success: true, data: ... }

// 失敗
createErrorResponse('Not Found', 404)
// { success: false, error: 'Not Found' }
```
