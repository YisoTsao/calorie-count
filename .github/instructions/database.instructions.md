---
applyTo: "{prisma/**,lib/prisma.ts}"
---

# Prisma / 資料庫規範

## 匯入方式

```typescript
import { prisma } from '@/lib/prisma'  // 始終使用 singleton
```

## 主要模型

| 模型 | 說明 |
|------|------|
| `User` | 核心使用者（含 `role: UserRole`） |
| `UserProfile` | 擴充資料（身高、體重、出生日期） |
| `Meal` | 餐點記錄（BREAKFAST / LUNCH / DINNER / SNACK / OTHER） |
| `Food` | 食物資料庫 + 自訂食物 |
| `Exercise` | 運動記錄（14 種運動類型） |
| `WaterIntake` | 飲水記錄 |
| `WeightRecord` | 體重記錄 |
| `DailyStats` | 每日統計快照 |
| `UserAchievement` | 成就系統 |

Schema 詳見 [prisma/schema.prisma](../../prisma/schema.prisma)

## 常用指令

```bash
bun db:push       # 推送 schema 變更（開發用，不產生 migration）
bun db:migrate    # 產生 migration 檔（生產前必用）
bun db:studio     # 視覺化資料庫介面
bun db:seed       # 種子資料（食物 DB + 成就資料）
```

## 規則

- 查詢資料**必須帶 `userId` 條件**，禁止未過濾的全表查詢
- 修改 schema 後必須執行 `bun db:generate`（`postinstall` 自動執行）
- 禁止在 Edge Runtime 中直接使用 Prisma（使用 `lib/auth.config.ts` 模式）
- N+1 問題：使用 `include` 一次 JOIN，不要在迴圈中查詢
