/**
 * AI Git Tools 配置檔案
 * 
 * 此檔案用於設定 AI 自動化 Git 工具的行為
 */

export default {
  // AI 相關配置
  ai: {
    model: 'gpt-4.1', // AI 模型
    maxDiffLength: 8000, // 最大 diff 長度
    maxRetries: 3, // 最大重試次數
  },

  // GitHub 相關配置
  github: {
    defaultBase: 'release', // PR 預設目標分支（使用 'release' 自動偵測最新 release 分支，如 release-2025-m11.1）
    autoLabels: true, // 自動新增 Labels
    includeImpactAnalysis: false, // 是否在 PR 中包含影響範圍分析和注意事項（使用 --include-impact 啟用）
  },

  // Reviewers 相關配置
  reviewers: {
    interactiveReviewers: true, // 啟用互動式 reviewer 選擇（true: 顯示選單，false: 跳過，創建 PR 後手動添加）
    maxSuggested: 5, // 最多建議幾位 reviewers（基於 Git 歷史分析）
    gitHistoryDepth: 20, // 分析 Git 歷史的深度（最近 N 筆 commits）
    excludeAuthors: [], // 排除的作者列表（例如：['bot@example.com', 'ci-user']）
  },

  // 輸出相關配置
  output: {
    verbose: true, // 詳細輸出
  },
};
