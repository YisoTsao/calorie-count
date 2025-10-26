# 實作任務清單: AI 食物辨識功能

## 1. 資料庫 Schema 擴展
- [ ] 1.1 建立 FoodRecognition 模型
- [ ] 1.2 建立 FoodItem 模型
- [ ] 1.3 建立 RecognitionStatus enum
- [ ] 1.4 執行資料庫遷移

## 2. 圖片儲存服務設定
- [ ] 2.1 選擇圖片儲存方案 (Vercel Blob / Cloudinary)
- [ ] 2.2 安裝相關套件 (`@vercel/blob` 或 `cloudinary`)
- [ ] 2.3 設定環境變數
- [ ] 2.4 建立 `lib/image-storage.ts` (上傳/刪除介面)

## 3. 圖片處理功能
- [ ] 3.1 安裝 `sharp` 套件
- [ ] 3.2 建立 `lib/image-processor.ts`
- [ ] 3.3 實作圖片壓縮功能
- [ ] 3.4 實作圖片格式轉換 (WEBP)
- [ ] 3.5 實作 EXIF 方向修正

## 4. OpenAI Vision 整合
- [ ] 4.1 安裝 `openai` 套件
- [ ] 4.2 設定 OPENAI_API_KEY 環境變數
- [ ] 4.3 建立 `lib/ai/openai-client.ts`
- [ ] 4.4 設計食物辨識 Prompt
- [ ] 4.5 建立 `lib/ai/food-recognition.ts`
- [ ] 4.6 實作重試機制
- [ ] 4.7 實作錯誤處理

## 5. API 路由實作
- [ ] 5.1 建立 `app/api/recognition/upload/route.ts`
- [ ] 5.2 建立 `app/api/recognition/[id]/route.ts` (GET)
- [ ] 5.3 建立 `app/api/recognition/[id]/route.ts` (PATCH)
- [ ] 5.4 建立 `app/api/recognition/[id]/save/route.ts`
- [ ] 5.5 建立 `app/api/recognition/[id]/delete/route.ts`
- [ ] 5.6 實作成本控制中間件

## 6. 驗證 Schema
- [ ] 6.1 建立 `lib/validations/recognition.ts`
- [ ] 6.2 定義圖片上傳驗證規則
- [ ] 6.3 定義食物項目編輯驗證
- [ ] 6.4 定義儲存到飲食記錄驗證

## 7. TypeScript 型別定義
- [ ] 7.1 建立 `types/recognition.ts`
- [ ] 7.2 定義 FoodRecognitionResult 型別
- [ ] 7.3 定義 FoodItem 型別
- [ ] 7.4 定義 OpenAI Response 型別

## 8. UI 元件開發 - 上傳相關
- [ ] 8.1 安裝 `react-webcam` 套件
- [ ] 8.2 建立 `components/recognition/camera-capture.tsx`
- [ ] 8.3 建立 `components/recognition/image-upload.tsx`
- [ ] 8.4 建立 `components/recognition/image-preview.tsx`
- [ ] 8.5 建立 `components/recognition/upload-progress.tsx`

## 9. UI 元件開發 - 辨識結果
- [ ] 9.1 建立 `components/recognition/recognition-loading.tsx`
- [ ] 9.2 建立 `components/recognition/food-item-card.tsx`
- [ ] 9.3 建立 `components/recognition/food-item-editor.tsx`
- [ ] 9.4 建立 `components/recognition/portion-adjuster.tsx`
- [ ] 9.5 建立 `components/recognition/nutrition-summary.tsx`
- [ ] 9.6 建立 `components/recognition/confidence-badge.tsx`

## 10. UI 元件開發 - 儲存與歷史
- [ ] 10.1 建立 `components/recognition/save-to-meal-dialog.tsx`
- [ ] 10.2 建立 `components/recognition/recognition-history-card.tsx`
- [ ] 10.3 建立 `components/recognition/empty-state.tsx`
- [ ] 10.4 建立 `components/recognition/error-state.tsx`

## 11. 頁面實作
- [ ] 11.1 建立 `app/(dashboard)/scan/page.tsx` (主掃描頁)
- [ ] 11.2 建立 `app/(dashboard)/scan/result/[id]/page.tsx` (結果頁)
- [ ] 11.3 建立 `app/(dashboard)/scan/history/page.tsx` (歷史記錄)
- [ ] 11.4 建立 `app/(dashboard)/scan/layout.tsx`

## 12. 狀態管理
- [ ] 12.1 建立 `store/recognition-store.ts` (Zustand)
- [ ] 12.2 實作辨識狀態管理
- [ ] 12.3 實作結果快取
- [ ] 12.4 實作樂觀更新

## 13. 導航整合
- [ ] 13.1 在 Sidebar 新增「掃描」連結
- [ ] 13.2 在儀表板新增快速掃描按鈕
- [ ] 13.3 新增浮動掃描按鈕 (FAB)

## 14. 錯誤處理與重試
- [ ] 14.1 實作圖片上傳失敗處理
- [ ] 14.2 實作 AI 辨識失敗處理
- [ ] 14.3 實作網路錯誤重試
- [ ] 14.4 實作手動重新辨識功能

## 15. 成本控制
- [ ] 15.1 實作每日辨識次數限制
- [ ] 15.2 建立辨識配額檢查
- [ ] 15.3 顯示剩餘次數
- [ ] 15.4 實作付費升級提示 (可選)

## 16. 效能優化
- [ ] 16.1 實作圖片懶加載
- [ ] 16.2 實作結果快取機制
- [ ] 16.3 優化 AI API 呼叫
- [ ] 16.4 實作背景上傳

## 17. 測試與驗證
- [ ] 17.1 測試相機拍照功能 (移動裝置)
- [ ] 17.2 測試圖片上傳 (各種格式)
- [ ] 17.3 測試 AI 辨識準確度 (多種食物)
- [ ] 17.4 測試結果編輯功能
- [ ] 17.5 測試儲存到飲食記錄
- [ ] 17.6 測試錯誤處理流程
- [ ] 17.7 測試成本控制機制
- [ ] 17.8 測試響應式設計

## 18. 文件撰寫
- [ ] 18.1 撰寫 AI 辨識 API 文件
- [ ] 18.2 撰寫 Prompt Engineering 指南
- [ ] 18.3 記錄成本預估與優化建議
- [ ] 18.4 撰寫使用者操作指南

## 實作順序建議
1. **1-4** (資料庫與 AI 整合基礎)
2. **5-7** (API 與驗證)
3. **8-10** (UI 元件)
4. **11-13** (頁面與導航)
5. **14-16** (錯誤處理與優化)
6. **17-18** (測試與文件)

## 預估時間
- 第 1 天: 完成 1-7 (資料庫、AI 整合、API)
- 第 2 天: 完成 8-10 (UI 元件)
- 第 3 天: 完成 11-14 (頁面、錯誤處理)
- 第 4 天: 完成 15-18 (優化、測試、文件)

## 依賴項目
- ✅ init-project-foundation (API 標準、錯誤處理)
- ✅ implement-user-management (使用者資料、配額管理)
- ⬜ implement-meal-records (儲存飲食記錄,可並行開發)

## 技術風險
- OpenAI API 可用性和延遲
- 辨識準確度依賴 Prompt 設計
- 圖片處理效能
- API 成本控制

## 成本預估
- OpenAI Vision API: ~$0.01-0.03 / 次辨識
- 圖片儲存: Vercel Blob 免費額度或 Cloudinary 免費層
- 預估每月成本 (1000 次辨識): $10-30
