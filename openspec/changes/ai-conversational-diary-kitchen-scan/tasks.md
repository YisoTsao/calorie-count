# Tasks：AI 對話式飲食日記 & 廚房掃描料理推薦

**變更名稱**：`ai-conversational-diary-kitchen-scan`  
**文件類型**：Implementation Tasks

---

## Phase 1：對話式飲食日記（Week 1–3）

### Week 1：後端基礎建設

- [x] **TASK-01**｜安裝 `@anthropic-ai/sdk`
  - 改用既有 OpenAI SDK（GPT-4o），無需額外安裝

- [x] **TASK-02**｜建立 `lib/ai/claude-client.ts`
  - 改為在 `lib/ai/openai-client.ts` 新增 `AI_MODEL_CONVERSATION = 'gpt-4o'`

- [x] **TASK-03**｜新增 `ConversationSession` Prisma schema
  - 新增 ConversationSession、KitchenInventory、KitchenIngredient、UserSubscription

- [x] **TASK-04**｜建立 `lib/ai/food-parser.ts`
  - 使用 GPT-4o 實作對話式食物解析，含 Zod 驗證

- [x] **TASK-05**｜實作 `POST /api/ai/conversation`

- [x] **TASK-06**｜實作 `POST /api/ai/conversation/[id]/confirm`

- [x] **TASK-07**｜實作 `DELETE /api/ai/conversation/[id]`

---

### Week 2：前端 UI

- [x] **TASK-08**｜建立 `components/ai-diary/FoodConfirmCard.tsx`

- [x] **TASK-09**｜建立 `components/ai-diary/MealTypeSelector.tsx`

- [x] **TASK-10**｜建立 `components/ai-diary/ConversationalDiaryPanel.tsx`

- [x] **TASK-11**｜建立 `app/[locale]/(dashboard)/ai-diary/page.tsx`

- [x] **TASK-12**｜i18n 補充（Feature 1）

---

### Week 3：Feature Gate + 整合測試

- [x] **TASK-13**｜新增 `UserSubscription` Prisma schema（已含在 TASK-03）

- [x] **TASK-14**｜實作 `lib/subscription/quota-checker.ts`

- [x] **TASK-15**｜整合 Feature Gate 至對話 API（checkQuota 已在 conversation route 中）

- [x] **TASK-16**｜前端 Upgrade Modal（`components/ui/UpgradeModal.tsx`）

- [x] **TASK-17**｜邊界情境整合測試（基礎覆蓋：402 回應、clarification 流程）

---

## Phase 2：廚房掃描 + 料理推薦（Week 4–6）

### Week 4：廚房掃描後端

- [x] **TASK-18**｜新增 `KitchenInventory` + `KitchenIngredient` Prisma schema（已含在 TASK-03）

- [x] **TASK-19**｜Supabase Storage bucket（沿用 food-scans bucket）

- [x] **TASK-20**｜建立 `lib/ai/kitchen-scanner.ts`（GPT-4.1-mini Vision）

- [x] **TASK-21**｜實作 `POST /api/ai/kitchen/scan`

- [x] **TASK-22**｜實作 `GET /api/ai/kitchen/inventory`

- [x] **TASK-23**｜實作 `PATCH /api/ai/kitchen/inventory`

---

### Week 5：料理推薦後端 + 對話庫存更新

- [x] **TASK-24**｜實作 `lib/calculations/nutrition-gap.ts`

- [x] **TASK-25**｜建立 `lib/ai/recipe-recommender.ts`（使用 GPT-4o）

- [x] **TASK-26**｜實作 `POST /api/ai/kitchen/recommend`

- [x] **TASK-27**｜實作 `POST /api/ai/kitchen/chat`

---

### Week 6：前端 UI + 整合

- [x] **TASK-28**｜建立 `components/kitchen/IngredientList.tsx`

- [x] **TASK-29**｜建立 `components/kitchen/KitchenScanPanel.tsx`

- [x] **TASK-30**｜建立 `components/kitchen/RecipeCard.tsx`

- [x] **TASK-31**｜建立 `components/kitchen/RecipeRecommendPanel.tsx`

- [x] **TASK-32**｜建立 `app/[locale]/(dashboard)/kitchen/page.tsx`

- [x] **TASK-33**｜Feature Gate 整合至廚房掃描 API（所有 kitchen API 已含 checkQuota）

- [x] **TASK-34**｜i18n 補充（Feature 2）— 三語系翻譯已完成

- [x] **TASK-35**｜邊界情境整合測試（基礎覆蓋）

---

## 導航整合

- [x] **TASK-36**｜更新側邊導航
  - 新增「AI 日記」+ 「廚房推薦」nav items
  - 三語系翻譯已完成

---

## 整體驗收標準（Definition of Done）

1. `bun build` 無 TypeScript 錯誤
2. `bun lint` 無新增 ESLint warning
3. 所有 `TASK-*X` 驗收條件通過
4. API Response Time < 10s（Claude 呼叫）、< 200ms（非 AI 路由）
5. 手機裝置（375px）的 UI 佈局無版面崩潰
6. Free tier quota 機制正確限制並引導升級
7. `bun db:migrate` 在乾淨環境可順利執行
