# 🚀 OpenSpec 快速參考卡

## 📁 檔案位置速查

```
openspec/
├── project.md                              # 專案技術棧、規範
├── AGENTS.md                               # AI 助手指引
│
├── specs/                                  # 系統規格 (當前真實狀態)
│   └── (完成後的規格會移到這裡)
│
└── changes/                                # 變更提案
    ├── init-project-foundation/           # 🎯 當前變更
    │   ├── proposal.md                    # 為何做、影響範圍
    │   ├── tasks.md                       # 67 個實作任務
    │   └── specs/                         # 新增的規格
    │       ├── user-auth/spec.md          # 認證規格
    │       ├── database-schema/spec.md    # 資料庫規格
    │       └── api-standards/spec.md      # API 規格
    │
    └── archive/                           # 已完成的變更
```

## ⌨️ 常用指令

```bash
# 查看所有變更
openspec list

# 查看變更詳情
openspec show init-project-foundation

# 驗證規格格式
openspec validate init-project-foundation

# 嚴格驗證
openspec validate init-project-foundation --strict

# 歸檔完成的變更
openspec archive init-project-foundation --yes

# 查看 JSON 格式 (給 AI 用)
openspec show init-project-foundation --json
```

## 💬 與 GitHub Copilot 對話範例

### 開始實作
```
請實作 init-project-foundation 變更。
先讀取 openspec/changes/init-project-foundation/ 下的:
- proposal.md (了解目標)
- tasks.md (任務清單)  
- specs/ (規格要求)
然後從第 1 項任務開始,完成後標記為 [x]。
```

### 詢問進度
```
init-project-foundation 目前完成了哪些任務?
```

### 查看規格
```
user-auth 規格中對於 Email 註冊有什麼要求?
```

### 建立新變更
```
請創建新的 OpenSpec 變更提案: implement-user-management
用於實作會員中心功能。
```

## 📋 規格檔案格式

### proposal.md 結構
```markdown
# 變更標題

## Why
為什麼要做這個變更

## What Changes
- 具體的變更項目

## Impact
- Affected Specs: 影響的規格
- Affected Code: 影響的程式碼
- Breaking Changes: 是否有破壞性變更

## Success Criteria
- ✅ 成功標準
```

### tasks.md 結構
```markdown
## 1. 任務群組
- [ ] 1.1 具體任務
- [ ] 1.2 具體任務
- [x] 1.3 已完成任務

## 2. 下一個群組
- [ ] 2.1 任務
```

### spec.md 結構 (Delta 格式)
```markdown
## ADDED Requirements
### Requirement: 需求名稱
需求描述 (使用 MUST/SHOULD/MAY)

#### Scenario: 情境名稱
- **WHEN** 某個條件
- **THEN** 系統行為
- **AND** 額外行為

## MODIFIED Requirements
(修改現有需求)

## REMOVED Requirements
(移除的需求)
```

## 🎯 工作流程

```
1. 查看變更
   ↓
   openspec show <change-name>

2. 開始實作
   ↓
   依照 tasks.md 逐項完成

3. 更新任務狀態
   ↓
   - [ ] → - [x]

4. 測試驗證
   ↓
   確保符合 specs/ 的 Scenarios

5. 歸檔變更
   ↓
   openspec archive <change-name> --yes
   (specs/ 會合併到 openspec/specs/)

6. 建立下個變更
   ↓
   重複流程
```

## 📐 規格撰寫準則

### Requirement 應該
- ✅ 使用 MUST/SHOULD/MAY 明確表達
- ✅ 專注於「做什麼」而非「怎麼做」
- ✅ 可測試、可驗證

### Scenario 應該
- ✅ 使用 WHEN/THEN/AND 格式
- ✅ 具體、可執行
- ✅ 涵蓋正常與異常情況

### 避免
- ❌ 模糊的描述 ("良好的效能")
- ❌ 實作細節 (除非必要)
- ❌ 重複的內容

## 🔍 除錯技巧

### 查看規格被正確解析
```bash
openspec show init-project-foundation --json --deltas-only
```

### 驗證所有規格
```bash
openspec validate --strict
```

### 查看完整變更內容
```bash
cat openspec/changes/init-project-foundation/proposal.md
cat openspec/changes/init-project-foundation/tasks.md
```

## 📊 目前專案狀態

```
✅ OpenSpec CLI 已安裝 (v0.13.0)
✅ 專案規格已建立 (project.md)
✅ 第一個變更提案已建立 (init-project-foundation)
   - proposal.md ✅
   - tasks.md ✅ (0/67 tasks)
   - specs/user-auth ✅
   - specs/database-schema ✅
   - specs/api-standards ✅

⬜ 下一步: 開始實作任務
⬜ 完成後: 歸檔變更
⬜ 之後: 建立下個變更提案
```

## 🎨 顏色標記

- 🎯 當前任務
- ✅ 已完成
- ⬜ 待辦
- ⚠️ 需要注意
- 🚀 下一步

## 📞 獲取幫助

- 查看 `OPENSPEC_GUIDE.md` 完整指南
- 查看 `GETTING_STARTED.md` 快速開始
- 查看 `openspec/project.md` 專案規範
- 詢問 GitHub Copilot
- 參考 [OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec)

---

💡 **提示:** 把這個檔案加入書籤,隨時快速查閱!
