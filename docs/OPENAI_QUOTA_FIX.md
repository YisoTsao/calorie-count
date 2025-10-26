# OpenAI API 配額問題解決指南

## 🚨 錯誤訊息
```
429 You exceeded your current quota, please check your plan and billing details.
```

## 📋 檢查步驟

### 1. 檢查 OpenAI 帳戶狀態
訪問：https://platform.openai.com/usage

檢查項目：
- [ ] 當前餘額（Current balance）
- [ ] 已使用額度（Usage this month）
- [ ] 配額限制（Rate limits）
- [ ] 付費方式（Payment method）

### 2. 檢查 API Key
訪問：https://platform.openai.com/api-keys

確認：
- [ ] API Key 是否有效
- [ ] Key 的權限設定
- [ ] Key 沒有被撤銷

---

## 🔧 解決方案

### 方案 A: 充值帳戶（生產環境推薦）

1. 訪問：https://platform.openai.com/settings/organization/billing
2. 點擊 "Add payment method"
3. 新增信用卡
4. 充值至少 $5-10 USD

**預估成本**:
- GPT-4o-mini Vision: ~$0.005-0.01 per image
- 100 張圖片約 $0.50-1.00

### 方案 B: 使用新的 API Key

如果你有多個 OpenAI 帳戶：

1. 建立新的 API Key
2. 更新 `.env` 檔案
3. 重啟開發伺服器

```bash
# .env
OPENAI_API_KEY="sk-proj-新的API-Key..."
```

### 方案 C: 暫時停用 AI 功能（開發測試用）

建立 Mock 模式，跳過實際 API 呼叫。

---

## 🛠️ 實作 Mock 模式（開發環境）

我可以幫你建立一個開發環境的 Mock 模式，讓你可以繼續測試其他功能，不需要真的呼叫 OpenAI。

### 特點：
- ✅ 立即返回假資料
- ✅ 不消耗 API 配額
- ✅ 可以測試 UI 和流程
- ✅ 生產環境自動停用

---

## 💰 成本估算

### OpenAI 定價（2024/10）
- GPT-4o-mini 輸入: $0.15 / 1M tokens
- GPT-4o-mini 輸出: $0.60 / 1M tokens
- 圖片處理（1920x1920）: ~1000 tokens

### 每次辨識成本
- 圖片 tokens: ~1000
- 回應 tokens: ~500
- **總計**: ~$0.001-0.005 per image

### 月度預估
| 使用量 | 每日 | 每月 | 成本 |
|--------|------|------|------|
| 低 | 10 張 | 300 張 | $0.30-1.50 |
| 中 | 50 張 | 1500 張 | $1.50-7.50 |
| 高 | 100 張 | 3000 張 | $3.00-15.00 |

---

## 🔄 快速修復（使用 Mock）

要我幫你實作開發環境的 Mock 模式嗎？這樣你可以：
1. 繼續開發和測試
2. 不消耗 OpenAI 配額
3. 等充值後再啟用真實 API

---

## 📊 監控建議

### 設定用量警報
1. 訪問：https://platform.openai.com/settings/organization/billing/limits
2. 設定月度預算上限（例如 $10）
3. 設定警報（達到 50%, 80%, 100%）

### 追蹤使用情況
```typescript
// lib/ai/food-recognition.ts
// 在每次 API 呼叫後記錄
console.log('[OpenAI] API call completed', {
  timestamp: new Date(),
  model: 'gpt-4o-mini',
  estimatedCost: '$0.005'
});
```

---

## ⚡ 立即行動

### 選項 1: 充值（最快）
1. 前往 https://platform.openai.com/settings/organization/billing
2. 新增付費方式
3. 充值 $5-10
4. 5-10 分鐘內生效

### 選項 2: 使用 Mock（開發測試）
回覆 "使用 Mock" 我會幫你設定

### 選項 3: 更換 API Key
如果你有其他帳戶的 key

---

## 🔍 驗證修復

充值或更換 Key 後：

```bash
# 測試 API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 應該看到模型列表，而不是 429 錯誤
```

---

**建議**: 先充值 $5-10 到 OpenAI 帳戶，這樣就能立即恢復功能。如果只是測試開發，我可以幫你設定 Mock 模式。

你想要哪個方案？
