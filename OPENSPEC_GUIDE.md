# AI 食物卡路里辨識系統 - OpenSpec 開發計畫

## 📋 專案概述
使用 OpenSpec 的 Spec-driven Development 方法，系統化地開發一套完整的 AI 食物卡路里辨識 Web 應用程式。

## 🎯 開發流程

### OpenSpec 三階段工作流

```
1. 創建變更提案 (Creating Changes)
   └─ 撰寫 proposal.md + tasks.md + specs/

2. 實作變更 (Applying Changes)  
   └─ 依照 tasks.md 逐步實作
   └─ 標記完成的任務

3. 歸檔變更 (Archiving Changes)
   └─ 將 specs/ 合併到主規格
   └─ 移動到 changes/archive/
```

## 📦 專案功能模組拆分

### Phase 1: 基礎架構 (2-3天)
**Change: `init-project-foundation`** ✅ 已建立
- 資料庫設計 (Prisma Schema)
- 認證系統 (NextAuth.js)
- API 標準與錯誤處理
- 基礎 UI 元件庫
- 受保護路由中間件

### Phase 2: 會員功能 (2天)
**Change: `implement-user-management`**
- 會員中心頁面
- 個人資料編輯
- 目標設定
- 偏好設定
- 密碼修改
- 帳號刪除

### Phase 3: AI 食物辨識 (3-4天)
**Change: `implement-food-recognition`**
- 圖片上傳與壓縮
- OpenAI Vision API 整合
- 辨識結果展示與編輯
- 份量調整介面
- 儲存到飲食記錄

### Phase 4: 飲食記錄 (2-3天)
**Change: `implement-meal-records`**
- 每日飲食記錄頁面
- 早/午/晚/點心分類
- 手動新增食物
- 編輯/刪除記錄
- 每日營養儀表板
- 常用食物管理

### Phase 5: 營養追蹤 (2天)
**Change: `implement-nutrition-tracking`**
- 水分攝取記錄
- 運動消耗記錄
- 體重記錄
- 每日摘要統計

### Phase 6: 數據分析 (3天)
**Change: `implement-analytics`**
- 卡路里趨勢圖表
- 體重變化曲線
- 營養素平衡分析
- 常吃食物排行
- 用餐時間分析
- 成就徽章系統

### Phase 7: 食物資料庫 (2-3天)
**Change: `implement-food-database`**
- 食物搜尋功能
- 分類瀏覽
- 食物詳情頁面
- 常見品牌與餐廳
- 我的最愛管理

### Phase 8: 社群功能 (3-4天) (Optional)
**Change: `implement-social-features`**
- 動態牆
- 發布分享
- 好友系統
- 按讚留言
- 排行榜

### Phase 9: 優化與上線 (2-3天)
**Change: `optimize-and-deploy`**
- 效能優化
- SEO 設定
- 錯誤追蹤 (Sentry)
- 部署到 Vercel
- 監控設定

## 🚀 使用 OpenSpec 開發步驟

### 1. 查看現有變更
```bash
# 列出所有變更提案
openspec list

# 查看特定變更的詳細資訊
openspec show init-project-foundation

# 驗證變更規格格式
openspec validate init-project-foundation
```

### 2. 開始實作變更
在 VS Code 中對 GitHub Copilot 說:
```
請幫我實作 init-project-foundation 這個 OpenSpec 變更。
請先查看 openspec/changes/init-project-foundation/ 目錄下的:
- proposal.md (了解為什麼要做)
- tasks.md (實作任務清單)
- specs/ (規格要求)

然後依照 tasks.md 的順序逐步實作,每完成一個任務就標記為 [x]。
```

### 3. 實作過程中
- 遵循 `specs/` 中的規格要求
- 依序完成 `tasks.md` 中的任務
- 完成一項就更新 checkbox: `- [x]`
- 遇到問題可以參考 `openspec/project.md`

### 4. 完成後歸檔
```bash
# 所有任務完成後,歸檔變更
openspec archive init-project-foundation --yes

# 這會:
# - 將 specs/ 合併到 openspec/specs/ (成為系統的真實狀態)
# - 移動整個變更到 openspec/changes/archive/
```

### 5. 開始下一個變更
建立新的變更提案:
```
請幫我創建一個 OpenSpec 變更提案,名稱為 implement-user-management,
用於實作會員中心相關功能。
```

GitHub Copilot 會自動:
- 建立 `openspec/changes/implement-user-management/` 目錄
- 生成 `proposal.md`, `tasks.md`, `specs/` 等檔案

## 📂 目錄結構

```
calorie-count/
├── openspec/
│   ├── project.md                          # ✅ 專案概述
│   ├── AGENTS.md                           # AI 助手指引 (自動生成)
│   │
│   ├── specs/                              # 系統當前規格 (真實狀態)
│   │   ├── user-auth/                     # 會員認證 (完成後)
│   │   ├── user-profile/                  # 會員資料 (完成後)
│   │   ├── database-schema/               # 資料庫 (完成後)
│   │   ├── api-standards/                 # API 標準 (完成後)
│   │   └── ...                            # 其他已完成的規格
│   │
│   └── changes/                            # 進行中或計劃的變更
│       ├── init-project-foundation/       # ✅ 當前變更
│       │   ├── proposal.md                # ✅ 提案說明
│       │   ├── tasks.md                   # ✅ 任務清單
│       │   └── specs/                     # ✅ 新增的規格
│       │       ├── user-auth/
│       │       ├── database-schema/
│       │       └── api-standards/
│       │
│       ├── implement-user-management/     # 下一個變更 (待建立)
│       ├── implement-food-recognition/    # 未來的變更 (待建立)
│       │
│       └── archive/                       # 已完成的變更
│           └── YYYY-MM-DD-change-name/
│
├── app/                                   # Next.js App Router
├── components/                            # React 元件
├── lib/                                   # 共用程式庫
├── prisma/                                # Prisma Schema
└── ...
```

## 🎨 與 GitHub Copilot 協作範例

### 創建新變更提案
```
You: 請幫我創建一個 OpenSpec 變更提案,實作食物辨識功能

Copilot: 我會創建 openspec/changes/implement-food-recognition/ 
包含 proposal.md (說明為何需要此功能、影響範圍)、
tasks.md (實作步驟)、specs/ (規格要求)
```

### 實作變更
```
You: 請開始實作 init-project-foundation 變更

Copilot: 我會:
1. 讀取 openspec/changes/init-project-foundation/proposal.md
2. 讀取 tasks.md 了解所有任務
3. 讀取 specs/ 了解規格要求  
4. 依序完成每個任務並標記為 [x]
5. 確保程式碼符合規格定義的 Scenarios
```

### 檢視進度
```
You: 目前 init-project-foundation 完成了哪些任務?

Copilot: (會讀取 tasks.md 並回報進度)
```

### 歸檔完成的變更
```
You: 請歸檔 init-project-foundation 變更

Copilot: 我會執行:
openspec archive init-project-foundation --yes
這會將規格合併到主目錄並歸檔此變更。
```

## ⚡ 優勢

### 使用 OpenSpec 的好處

1. **明確的規格** - 先定義行為,再寫程式碼
2. **可追蹤的變更** - 每個功能都有完整的提案和任務清單
3. **AI 友善** - GitHub Copilot 能理解結構化的規格
4. **團隊協作** - 所有人都知道系統「應該」做什麼
5. **文件自動化** - specs/ 就是最新的文件
6. **版本控制** - 變更歷史清楚記錄在 archive/

### 與傳統開發的對比

| 傳統開發 | OpenSpec 開發 |
|---------|-------------|
| 邊寫邊想規格 | 先寫規格後開發 |
| 文件與程式碼分離 | 規格即文件 |
| AI 難以理解意圖 | AI 能精準實作 |
| 功能蔓延 | 範圍明確 |
| 難以追蹤變更原因 | 每個變更都有 proposal |

## 📊 預估時間表

- **Phase 1**: 2-3 天 (基礎架構) ← **你現在在這裡**
- **Phase 2**: 2 天 (會員功能)
- **Phase 3**: 3-4 天 (AI 辨識)
- **Phase 4**: 2-3 天 (飲食記錄)
- **Phase 5**: 2 天 (營養追蹤)
- **Phase 6**: 3 天 (數據分析)
- **Phase 7**: 2-3 天 (食物資料庫)
- **Phase 8**: 3-4 天 (社群,可選)
- **Phase 9**: 2-3 天 (優化上線)

**總計**: 約 21-28 個工作天 (不含社群功能)

## 🎯 下一步行動

現在你已經有:
- ✅ `openspec/project.md` - 專案概述
- ✅ `openspec/changes/init-project-foundation/` - 第一個變更提案
  - ✅ `proposal.md` - 提案說明
  - ✅ `tasks.md` - 實作任務 (115 個任務)
  - ✅ `specs/user-auth/spec.md` - 認證規格
  - ✅ `specs/database-schema/spec.md` - 資料庫規格
  - ✅ `specs/api-standards/spec.md` - API 規格

**請告訴 GitHub Copilot:**
```
請開始實作 init-project-foundation 這個 OpenSpec 變更。
先從 tasks.md 的第 1 大項「環境設定與套件安裝」開始,
依序完成所有任務並標記為 [x]。
```

Copilot 會自動:
1. 安裝必要的 npm 套件
2. 建立 Prisma Schema
3. 設定 NextAuth.js
4. 建立 API Routes
5. 實作 UI 元件
6. ...依序完成所有 115 個任務

開發愉快! 🚀
