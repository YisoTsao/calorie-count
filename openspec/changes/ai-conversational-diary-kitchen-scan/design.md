# Design：AI 對話式飲食日記 & 廚房掃描料理推薦

**變更名稱**：`ai-conversational-diary-kitchen-scan`  
**文件類型**：Technical Design

---

## 1. 資料庫 Schema 變更

### 新增 Prisma Models

```prisma
// ==================== 對話式飲食日記 ====================

enum ConversationStatus {
  ACTIVE      // 對話進行中
  CONFIRMED   // 已確認並寫入飲食記錄
  ABANDONED   // 超時或放棄
}

model ConversationSession {
  id               String             @id @default(cuid())
  userId           String
  status           ConversationStatus @default(ACTIVE)
  messages         Json               // ConversationMessage[]
  pendingFoods     Json               // ParsedFood[]（等待確認）
  suggestedMealType MealType          @default(LUNCH)
  mealDate         DateTime           @default(now())
  expiresAt        DateTime           // 建立時 + 24h
  confirmedMealId  String?            // 確認後關聯的 Meal

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, status])
  @@index([expiresAt])        // 用於 TTL 清理
  @@map("conversation_sessions")
}

// ==================== 廚房食材庫存 ====================

model KitchenInventory {
  id            String             @id @default(cuid())
  userId        String             @unique   // 每位用戶只有一份庫存
  scanImages    String[]           // 掃描圖片 URL 陣列
  lastScannedAt DateTime?
  ingredients   KitchenIngredient[]

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("kitchen_inventories")
}

enum IngredientAddedVia {
  SCAN
  CHAT
  MANUAL
}

model KitchenIngredient {
  id           String             @id @default(cuid())
  inventoryId  String
  name         String
  category     String             // 蛋白質/蔬菜/澱粉/調味料/乳製品/水果/其他
  quantity     String             // 描述性：「3個」「半袋」
  isAvailable  Boolean            @default(true)
  aiConfidence Float?             // 掃描時的識別信心度
  addedVia     IngredientAddedVia @default(SCAN)
  scanImageUrl String?            // 對應掃描圖片 URL（可選）

  inventory KitchenInventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([inventoryId])
  @@index([inventoryId, isAvailable])
  @@map("kitchen_ingredients")
}

// ==================== 訂閱制（預留架構）====================

enum SubscriptionPlan {
  FREE
  PREMIUM
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  TRIALING
}

model UserSubscription {
  id                    String             @id @default(cuid())
  userId                String             @unique
  plan                  SubscriptionPlan   @default(FREE)
  status                SubscriptionStatus @default(ACTIVE)
  currentPeriodStart    DateTime           @default(now())
  currentPeriodEnd      DateTime           // FREE 用戶設為 2099-12-31
  cancelAtPeriodEnd     Boolean            @default(false)

  // 付款整合預留欄位（Phase 3 填充）
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  paymentProvider       String?            // 'stripe' | 'newebpay' | 'ecpay'
  paymentMetadata       Json?              // 其他付款 metadata

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("user_subscriptions")
}
```

### 變更現有 Model

```prisma
// 在 User model 新增 relations：
model User {
  // ... 現有欄位 ...

  // 新增
  conversationSessions ConversationSession[]
  kitchenInventory     KitchenInventory?
  subscription         UserSubscription?
}

// 在 AiUsageLog.feature 現有 String 欄位加入新值
// 無需 schema 變更，新增 feature 值：
// 'conversational_diary' | 'kitchen_scan' | 'recipe_recommend' | 'kitchen_chat'
```

---

## 2. 目錄結構變更

```
app/
  api/
    ai/
      conversation/
        route.ts                 # POST（新建 / 繼續對話）
        [id]/
          confirm/
            route.ts             # POST（確認 → 寫入 Meal）
          route.ts               # DELETE（放棄對話）
      kitchen/
        scan/
          route.ts               # POST（上傳圖片 → AI 辨識）
        inventory/
          route.ts               # GET | PATCH
        recommend/
          route.ts               # POST（推薦料理）
        chat/
          route.ts               # POST（對話更新庫存）
  (dashboard)/
    [locale]/
      ai-diary/
        page.tsx                 # 對話式日記頁面
      kitchen/
        page.tsx                 # 廚房掃描 + 推薦頁面

components/
  ai-diary/
    ConversationalDiaryPanel.tsx # 主聊天介面（Client Component）
    FoodConfirmCard.tsx          # 食物確認卡片（列出解析結果）
    MealTypeSelector.tsx         # 餐別選擇器（AI 建議 + 用戶覆蓋）
  kitchen/
    KitchenScanPanel.tsx         # 廚房掃描介面（Client Component）
    IngredientList.tsx           # 可編輯食材清單
    RecipeCard.tsx               # 料理推薦卡片（顯示食材 + 營養）
    KitchenChatInput.tsx         # 對話更新庫存輸入框

lib/
  ai/
    claude-client.ts             # Anthropic SDK 初始化（新增）
    food-parser.ts               # 對話解析 prompt + 呼叫邏輯（新增）
    recipe-recommender.ts        # 料理推薦 prompt + 呼叫邏輯（新增）
    kitchen-scanner.ts           # 廚房圖片辨識（沿用 openai-client）
  subscription/
    quota-checker.ts             # 用量查詢 + 配額檢查（新增）
    subscription-guard.ts        # Feature Gate middleware（新增）

prisma/
  migrations/
    YYYYMMDD_add_conversation_session/
    YYYYMMDD_add_kitchen_inventory/
    YYYYMMDD_add_user_subscription/
```

---

## 3. API 實作細節

### 3.1 對話 API（POST /api/ai/conversation）

```typescript
// 核心邏輯流程
export async function POST(req: NextRequest) {
  // 1. 認證
  const session = await auth()
  if (!session?.user?.id) return createErrorResponse('Unauthorized', 401)

  // 2. 訂閱配額檢查（Feature Gate）
  const quota = await checkQuota(session.user.id, 'conversational_diary')
  if (!quota.allowed) return NextResponse.json({ error: 'QUOTA_EXCEEDED' }, { status: 402 })

  // 3. 解析請求
  const { message, sessionId, mealDate } = await req.json()

  // 4. 取得或建立 ConversationSession
  let convSession = sessionId
    ? await prisma.conversationSession.findFirst({
        where: { id: sessionId, userId: session.user.id, status: 'ACTIVE' }
      })
    : null

  if (!convSession) {
    convSession = await prisma.conversationSession.create({
      data: {
        userId: session.user.id,
        messages: [],
        pendingFoods: [],
        mealDate: mealDate ?? new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    })
  }

  // 5. 建構 Claude 訊息（含歷史）
  const messages = buildClaudeMessages(convSession, message)

  // 6. 呼叫 Claude API
  const result = await callClaudeFoodParser(messages, convSession.mealDate)

  // 7. 更新 session
  await prisma.conversationSession.update({
    where: { id: convSession.id },
    data: {
      messages: [...(convSession.messages as object[]), 
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: result.assistantMessage, timestamp: new Date(), parsedFoods: result.parsedFoods }
      ],
      pendingFoods: result.parsedFoods,
      suggestedMealType: result.suggestedMealType,
    }
  })

  // 8. 記錄 AI 用量
  logAiUsage({ userId: session.user.id, feature: 'conversational_diary', ...result.usage })

  return createSuccessResponse({ ...result, sessionId: convSession.id })
}
```

### 3.2 Feature Gate（訂閱配額檢查）

```typescript
// lib/subscription/quota-checker.ts

type AiFeature = 'conversational_diary' | 'kitchen_scan' | 'recipe_recommend' | 'kitchen_chat'

const MONTHLY_QUOTA: Record<string, Record<AiFeature, number>> = {
  FREE:    { conversational_diary: 20, kitchen_scan: 3,  recipe_recommend: 5,  kitchen_chat: 10 },
  PREMIUM: { conversational_diary: 200, kitchen_scan: 30, recipe_recommend: 60, kitchen_chat: 100 },
  PRO:     { conversational_diary: -1, kitchen_scan: -1, recipe_recommend: -1, kitchen_chat: -1 },
}

export async function checkQuota(userId: string, feature: AiFeature) {
  // 查詢訂閱（無訂閱記錄 → 視為 FREE）
  const sub = await prisma.userSubscription.findUnique({ where: { userId } })
  const plan = sub?.status === 'ACTIVE' ? sub.plan : 'FREE'
  const limit = MONTHLY_QUOTA[plan][feature]

  if (limit === -1) return { allowed: true, remaining: Infinity, plan }

  // 查詢本月用量
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const used = await prisma.aiUsageLog.count({
    where: { userId, feature, createdAt: { gte: monthStart } }
  })

  return { allowed: used < limit, remaining: Math.max(0, limit - used), plan, used, limit }
}
```

### 3.3 廚房掃描（POST /api/ai/kitchen/scan）

```typescript
// 核心流程：多張圖片 → GPT-4 Vision → 合併去重食材清單

async function recognizeIngredients(imageUrls: string[]): Promise<KitchenIngredient[]> {
  // 並行送出所有圖片（最多 5 張）
  const results = await Promise.all(
    imageUrls.map(url => callOpenAIVisionForIngredients(url))
  )
  
  // 合併結果，依名稱去重（同名食材合併數量）
  const merged = mergeIngredients(results.flat())
  return merged
}

// 廚房辨識 Prompt（沿用現有 openai-client）
const KITCHEN_SCAN_PROMPT = `
你是一位食材辨識專家。請分析這張廚房/冰箱照片，列出所有可見的食材。

回應格式（JSON 陣列）：
[
  {
    "name": "雞蛋",
    "category": "蛋白質",
    "quantity": "6個",
    "aiConfidence": 0.95
  }
]

規則：
1. 只列出明確可辨識的食材
2. quantity 用描述性文字（「半袋」「約3個」）
3. aiConfidence < 0.6 的食材仍列出，讓用戶確認
4. category 從以下選擇：蛋白質/蔬菜/澱粉/調味料/乳製品/水果/其他
`
```

---

## 4. UI 設計規格

### 4.1 對話式飲食日記（ConversationalDiaryPanel）

```
┌─────────────────────────────────────────┐
│  🤖 AI 飲食日記               ⚙️  歷史  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 剛吃了一碗牛肉麵，湯喝了一半   │ 👤 │
│  └─────────────────────────────────┘    │
│                                         │
│ ┌──────────────────────────────────┐    │
│ │ 🤖 好的！我幫你記錄了：         │    │
│ │                                  │    │
│ │ 🍜 牛肉麵（一碗）               │    │
│ │    熱量：520 kcal               │    │
│ │    蛋白質：28g  碳水：65g  脂：15g│   │
│ │                                  │    │
│ │ 🥣 牛肉湯（半碗）              │    │
│ │    熱量：45 kcal                │    │
│ │    ⚠️ 模糊描述，已用保守估算   │    │
│ │                                  │    │
│ │ 餐別：午餐 ✓               [換] │    │
│ │                                  │    │
│ │ ✅ 確認記錄     ✏️ 修改        │    │
│ └──────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 輸入今天吃了什麼...        [送出] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**狀態機**

```
IDLE → SENDING → PARSING → AWAITING_CONFIRM → CONFIRMED
                                ↓
                           EDITING（用戶修改後重送）
```

**關鍵 UX 規則**（依 Web Interface Guidelines）
- 送出後立即顯示 loading skeleton，< 3s 內回應
- `isFuzzy: true` 的食物顯示 ⚠️ icon + tooltip 說明
- `confidence < 0.7` 的食物以淡色顯示，提示「AI 不確定」
- 確認按鈕使用綠色主色調（Primary CTA），修改為次要按鈕
- 錯誤時顯示 `toast` + 「重試」CTA，不清除輸入

### 4.2 廚房掃描（KitchenScanPanel）

```
┌─────────────────────────────────────────┐
│  📸 廚房掃描                            │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ [照片] │ │ [照片] │ │  [+]   │       │
│  └────────┘ └────────┘ └────────┘       │
│  最多 5 張                              │
│                        [開始辨識 AI]   │
├─────────────────────────────────────────┤
│  食材清單（AI 辨識結果，可編輯）        │
│                                         │
│  🥚 雞蛋          6個    [✏️] [🗑]     │
│  🥦 花椰菜        半顆   [✏️] [🗑]     │
│  ⚠️ 豆腐?         1塊    [✏️] [🗑]     │  ← aiConfidence < 0.6
│  [+ 手動新增食材]                       │
├─────────────────────────────────────────┤
│  💬 快速更新（對話輸入）                │
│  ┌─────────────────────────────────┐    │
│  │ 雞蛋用完了，剛買了豆腐...  [→] │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 4.3 料理推薦（RecipeRecommendPanel）

```
┌─────────────────────────────────────────┐
│  🍳 今日料理推薦                        │
│  剩餘目標：蛋白質 45g | 熱量 650 kcal  │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🥗 蒜炒豆腐佐炒蛋   吻合度 92%  │  │
│  │                                   │  │
│  │ ⏱ 15 分鐘  難度：簡單           │  │
│  │ 食材：豆腐✓ 雞蛋✓ 蒜✓          │  │
│  │ 熱量 380 kcal  P:28g C:12g F:18g │  │
│  │                    [查看步驟 →]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🍲 番茄炒蛋      吻合度 78%     │  │
│  │ ⏱ 20 分鐘  難度：簡單           │  │
│  │ ...                               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [重新推薦]  [依偏好篩選]              │
└─────────────────────────────────────────┘
```

---

## 5. 安全性設計

### 5.1 AI 輸入驗證

```typescript
// 防止 Prompt Injection：限制用戶輸入長度並過濾特殊指令
const MAX_MESSAGE_LENGTH = 500

function sanitizeUserMessage(message: string): string {
  // 1. 截斷過長輸入
  const truncated = message.slice(0, MAX_MESSAGE_LENGTH)
  // 2. 不允許 system: / assistant: 開頭（防止 role injection）
  return truncated.replace(/^(system|assistant):\s*/i, '')
}
```

### 5.2 AI 輸出驗證

```typescript
// 使用 Zod 驗證 Claude 回傳的 JSON，防止惡意/異常輸出
const parsedFoodSchema = z.object({
  name: z.string().max(50),
  portionSize: z.number().min(0).max(5000),    // 單份 < 5kg
  calories: z.number().min(0).max(2000),        // 單品 < 2000 kcal
  protein: z.number().min(0).max(200),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(200),
  confidence: z.number().min(0).max(1),
  isFuzzy: z.boolean(),
})
```

### 5.3 圖片上傳安全

```typescript
// 廚房掃描圖片驗證
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  // 5MB per image
const MAX_IMAGES_PER_REQUEST = 5

// 上傳前壓縮至 < 1.5MB（沿用現有 client-image-compress.ts）
```

### 5.4 Rate Limiting

```typescript
// 對話 API：每用戶每分鐘最多 10 次請求（防止暴力 token 消耗）
// 廚房掃描：每用戶每小時最多 5 次
// 使用現有 api-middleware.ts 的 rate limiting 架構
```

---

## 6. 訂閱制架構預留

### 6.1 訂閱方案對照表

| 功能 | Free | Premium（NT$149/月） | Pro（NT$299/月） |
|------|------|---------------------|----------------|
| 對話記錄 | 20 次/月 | 200 次/月 | 無限 |
| 廚房掃描 | 3 次/月 | 30 次/月 | 無限 |
| 料理推薦 | 5 次/月 | 60 次/月 | 無限 |
| 對話庫存更新 | 10 次/月 | 100 次/月 | 無限 |
| 匯出飲食紀錄 | ✗ | ✓（CSV/PDF） | ✓ |
| 進階分析圖表 | ✗ | ✓ | ✓ |
| 家庭共用帳號 | ✗ | ✗ | 最多 3 人 |

### 6.2 Upgrade UX 流程

```
用戶達到配額上限
    ↓
API 返回 402 + { plan, used, limit, upgradeUrl }
    ↓
前端顯示 UpgradeModal（非 blocking alert）
    ↓
「了解更多」→ /pricing 頁面（已有 /api/pricing/plans 路由）
    ↓
（Phase 3）Stripe / 綠界 付款流程
```

### 6.3 新用戶初始化

```typescript
// 用戶首次登入後，自動建立 FREE 訂閱記錄
// 可掛在 NextAuth signIn callback 或首次 API 請求時 lazy create
async function ensureSubscription(userId: string) {
  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'),
    },
    update: {},  // 已存在則不覆蓋
  })
}
```
