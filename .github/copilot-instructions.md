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

